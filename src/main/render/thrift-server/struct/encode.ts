import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    FunctionType,
    InterfaceWithFields,
    ListType,
    MapType,
    SetType,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import { WRITE_METHODS, WriteMethodName } from './methods'

import {
    createConstStatement,
    createFunctionParameter,
    createMethodCall,
    createMethodCallStatement,
    createNotNullCheck,
    getInitializerForField,
    isNotVoid,
    propertyAccessForIdentifier,
} from '../utils'

import {
    createVoidType,
    thriftTypeForFieldType,
    typeNodeForFieldType,
} from '../types'

import { IResolvedIdentifier } from '../../../types'

import ResolverFile from '../../../resolver/file'
import { codecName, looseNameForStruct, throwForField } from './utils'

export function createTempVariables(
    node: InterfaceWithFields,
    file: ResolverFile,
): Array<ts.VariableStatement> {
    const structFields: Array<FieldDefinition> = node.fields.filter(
        (next: FieldDefinition): boolean => {
            return next.fieldType.type !== SyntaxType.VoidKeyword
        },
    )

    if (structFields.length > 0) {
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.obj,
                undefined,
                ts.createObjectLiteral(
                    node.fields.map(
                        (
                            next: FieldDefinition,
                        ): ts.ObjectLiteralElementLike => {
                            return ts.createPropertyAssignment(
                                next.name.value,
                                getInitializerForField(
                                    'args',
                                    next,
                                    file,
                                    true,
                                ),
                            )
                        },
                    ),
                    true, // multiline
                ),
            ),
        ]
    } else {
        return []
    }
}

export function createEncodeMethod(
    node: InterfaceWithFields,
    file: ResolverFile,
): ts.MethodDeclaration {
    const tempVariables: Array<ts.VariableStatement> = createTempVariables(
        node,
        file,
    )

    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.encode,
        undefined,
        undefined,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(looseNameForStruct(node)),
                    undefined,
                ),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.output,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TProtocol,
                    undefined,
                ),
            ),
        ],
        createVoidType(),
        ts.createBlock(
            [
                ...tempVariables,
                writeStructBegin(node.name.value),
                ...node.fields.filter(isNotVoid).map((field) => {
                    return createWriteForField(node, field, file)
                }),
                writeFieldStop(),
                writeStructEnd(),
                ts.createReturn(),
            ],
            true,
        ),
    )
}

/**
 * Write field to output protocol.
 *
 * If field is required, but not set, throw error.
 *
 * If field is optional and has a default value write the default if value not set.
 */
export function createWriteForField(
    node: InterfaceWithFields,
    field: FieldDefinition,
    file: ResolverFile,
): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(
        `obj.${field.name.value}`,
    )
    const thenWrite: ts.Statement = createWriteForFieldType(
        node,
        field,
        ts.createIdentifier(`obj.${field.name.value}`),
        file,
    )
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        isFieldNull,
        thenWrite, // Then block
        elseThrow === undefined ? undefined : ts.createBlock([elseThrow], true),
    )
}

/**
 * This generates the method calls to write for a single field
 *
 * EXAMPLE
 *
 * output.writeFieldBegin("id", Thrift.Type.I32, 1);
 * output.writeI32(obj.id);
 * output.writeFieldEnd();
 */
export function createWriteForFieldType(
    node: InterfaceWithFields,
    field: FieldDefinition,
    fieldName: ts.Identifier,
    file: ResolverFile,
): ts.Block {
    return ts.createBlock([
        writeFieldBegin(field, file),
        ...writeValueForField(node, field.fieldType, fieldName, file),
        writeFieldEnd(),
    ])
}

export function writeValueForIdentifier(
    id: IResolvedIdentifier,
    node: InterfaceWithFields,
    fieldName: ts.Identifier,
    file: ResolverFile,
): Array<ts.Expression> {
    switch (id.definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(
                `Identifier[${
                    id.definition.name.value
                }] is a value being used as a type`,
            )

        case SyntaxType.ServiceDefinition:
            throw new TypeError(
                `Service[${id.definition.name.value}] is being used as a type`,
            )

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createMethodCall(
                    ts.createIdentifier(codecName(id.resolvedName)),
                    'encode',
                    [fieldName, COMMON_IDENTIFIERS.output],
                ),
            ]

        case SyntaxType.EnumDefinition:
            return [
                writeMethodForName(
                    WRITE_METHODS[SyntaxType.I32Keyword],
                    fieldName,
                ),
            ]

        case SyntaxType.TypedefDefinition:
            return writeValueForType(
                node,
                id.definition.definitionType,
                fieldName,
                file,
            )

        default:
            const msg: never = id.definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function writeValueForType(
    node: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    file: ResolverFile,
): Array<ts.Expression> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return writeValueForIdentifier(
                file.resolveIdentifier(fieldType.value),
                node,
                fieldName,
                file,
            )

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.SetType:
            return [
                writeSetBegin(fieldType, fieldName, file),
                forEach(node, fieldType, fieldName, file),
                writeSetEnd(),
            ]

        case SyntaxType.MapType:
            return [
                writeMapBegin(fieldType, fieldName, file),
                forEach(node, fieldType, fieldName, file),
                writeMapEnd(),
            ]

        case SyntaxType.ListType:
            return [
                writeListBegin(fieldType, fieldName, file),
                forEach(node, fieldType, fieldName, file),
                writeListEnd(),
            ]

        /**
         * Base types:
         *
         * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
         * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
         * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword
         */
        case SyntaxType.BoolKeyword:
        case SyntaxType.BinaryKeyword:
        case SyntaxType.StringKeyword:
        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.ByteKeyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.I64Keyword:
            return [
                writeMethodForName(WRITE_METHODS[fieldType.type], fieldName),
            ]

        case SyntaxType.VoidKeyword:
            return []

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function writeMethodForName(
    methodName: WriteMethodName,
    fieldName: ts.Identifier,
): ts.CallExpression {
    return createMethodCall('output', methodName, [fieldName])
}

function writeValueForField(
    node: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    file: ResolverFile,
): Array<ts.ExpressionStatement> {
    return writeValueForType(node, fieldType, fieldName, file).map(
        ts.createStatement,
    )
}

/**
 * Loop through container types and write the values for all children
 *
 * EXAMPLE FOR SET
 *
 * // thrift
 * node MyStruct {
 *   1: required set<string> field1;
 * }
 *
 * // typescript
 * obj.field1.forEach((value_1: string): void => {
 *   output.writeString(value_1);
 * });
 */
function forEach(
    node: InterfaceWithFields,
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    file: ResolverFile,
): ts.CallExpression {
    const value: ts.Identifier = ts.createUniqueName('value')
    const forEachParameters: Array<ts.ParameterDeclaration> = [
        createFunctionParameter(
            value,
            typeNodeForFieldType(fieldType.valueType, file, true),
        ),
    ]

    const forEachStatements: Array<ts.Statement> = [
        ...writeValueForField(node, fieldType.valueType, value, file),
    ]

    // If map we have to handle key type as well as value type
    if (fieldType.type === SyntaxType.MapType) {
        const key: ts.Identifier = ts.createUniqueName('key')
        forEachParameters.push(
            createFunctionParameter(
                key,
                typeNodeForFieldType(fieldType.keyType, file, true),
            ),
        )

        forEachStatements.unshift(
            ...writeValueForField(node, fieldType.keyType, key, file),
        )
    }

    return createMethodCall(fieldName, 'forEach', [
        ts.createArrowFunction(
            undefined, // modifiers
            undefined, // type parameters
            forEachParameters, // parameters
            createVoidType(), // return type,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // greater than equals token
            ts.createBlock(forEachStatements, true), // body
        ),
    ])
}

// output.writeStructBegin(<structName>)
export function writeStructBegin(structName: string): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructBegin', [
        ts.createLiteral(structName),
    ])
}

// output.writeStructEnd()
export function writeStructEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructEnd')
}

// output.writeMapBeing(<field.keyType>, <field.valueType>, <field.size>)
export function writeMapBegin(
    fieldType: MapType,
    fieldName: string | ts.Identifier,
    file: ResolverFile,
): ts.CallExpression {
    return createMethodCall('output', 'writeMapBegin', [
        thriftTypeForFieldType(fieldType.keyType, file),
        thriftTypeForFieldType(fieldType.valueType, file),
        propertyAccessForIdentifier(fieldName, 'size'),
    ])
}

// output.writeMapEnd()
export function writeMapEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeMapEnd')
}

// output.writeListBegin(<field.type>, <field.length>)
export function writeListBegin(
    fieldType: ListType,
    fieldName: string | ts.Identifier,
    file: ResolverFile,
): ts.CallExpression {
    return createMethodCall('output', 'writeListBegin', [
        thriftTypeForFieldType(fieldType.valueType, file),
        propertyAccessForIdentifier(fieldName, 'length'),
    ])
}

// output.writeListEnd()
export function writeListEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeListEnd')
}

// output.writeSetBegin(<field.type>, <field.size>)
export function writeSetBegin(
    fieldType: SetType,
    fieldName: string | ts.Identifier,
    file: ResolverFile,
): ts.CallExpression {
    return createMethodCall('output', 'writeSetBegin', [
        thriftTypeForFieldType(fieldType.valueType, file),
        propertyAccessForIdentifier(fieldName, 'size'),
    ])
}

// output.writeSetEnd()
export function writeSetEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeSetEnd')
}

// output.writeFieldBegin(<field.name>, <field.fieldType>, <field.fieldID>)
export function writeFieldBegin(
    field: FieldDefinition,
    file: ResolverFile,
): ts.ExpressionStatement {
    if (field.fieldID !== null) {
        return createMethodCallStatement('output', 'writeFieldBegin', [
            ts.createLiteral(field.name.value),
            thriftTypeForFieldType(field.fieldType, file),
            ts.createLiteral(field.fieldID.value),
        ])
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}

// output.writeFieldEnd
export function writeFieldEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldEnd')
}

// output.writeFieldStop
export function writeFieldStop(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldStop')
}
