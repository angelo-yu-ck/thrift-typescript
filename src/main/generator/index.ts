import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { rendererForTarget } from '../render'
import { processStatements, renderStatement } from './iterator'

import { exportsForFile } from '../resolver/utils'
import {
    IGeneratedFile,
    INamespace,
    IRenderer,
    IRenderState,
    IThriftProject,
} from '../types'

/**
 * Export this directly is useful for generating code without generating files
 */
export { processStatements } from './iterator'

/**
 * The generator is the primary interface for generating TypeScript code from
 * Thrift IDL. It takes a hash of options that inform it on how to resolve files
 * and where to save generated code.
 *
 * When a Thrift file includes another Thrift file the first place we search for
 * the include is local to the including file. If no matching file is found we
 * search relative to the sourceDir defined in the options.
 *
 * @param options
 */
export function generateFile(
    renderer: IRenderer,
    statements: Array<ThriftStatement>,
    state: IRenderState,
): Array<ts.Statement> {
    return processStatements(statements, state, renderer)
}

export function generateProject(
    thriftProject: IThriftProject,
): Array<IGeneratedFile> {
    const result: Array<IGeneratedFile> = []
    const renderer: IRenderer = rendererForTarget(thriftProject.options.target)

    Object.keys(thriftProject.namespaces).forEach((namespaceName: string) => {
        const namespace: INamespace = thriftProject.namespaces[namespaceName]

        if (namespace.constants.length > 0) {
            const constantsFile: IGeneratedFile = {
                type: 'GeneratedFile',
                name: 'constants',
                path: namespace.namespace.path,
                body: [],
            }

            const state: IRenderState = {
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: exportsForFile(namespace.constants),
                project: thriftProject,
            }

            namespace.constants.forEach(
                (statement: ConstDefinition | EnumDefinition) => {
                    constantsFile.body = [
                        ...constantsFile.body,
                        ...renderStatement(statement, state, renderer),
                    ]
                },
            )

            constantsFile.body = [
                ...renderer.renderImports(namespace.constants, state),
                ...constantsFile.body,
            ]

            result.push(constantsFile)
        }

        if (namespace.typedefs.length > 0) {
            const typedefsFile: IGeneratedFile = {
                type: 'GeneratedFile',
                name: 'typedefs',
                path: namespace.namespace.path,
                body: [],
            }

            const state: IRenderState = {
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: exportsForFile(namespace.typedefs),
                project: thriftProject,
            }

            namespace.typedefs.forEach((statement: TypedefDefinition) => {
                typedefsFile.body = [
                    ...typedefsFile.body,
                    ...renderStatement(statement, state, renderer),
                ]
            })

            typedefsFile.body = [
                ...renderer.renderImports(namespace.typedefs, state),
                ...typedefsFile.body,
            ]

            result.push(typedefsFile)
        }

        ;[
            ...namespace.structs,
            ...namespace.unions,
            ...namespace.exceptions,
        ].forEach(
            (
                statement:
                    | StructDefinition
                    | UnionDefinition
                    | ExceptionDefinition,
            ) => {
                const state: IRenderState = {
                    options: thriftProject.options,
                    currentNamespace: namespace,
                    currentDefinitions: exportsForFile([statement]),
                    project: thriftProject,
                }

                const structFile: IGeneratedFile = {
                    type: 'GeneratedFile',
                    name: statement.name.value,
                    path: namespace.namespace.path,
                    body: renderStatement(statement, state, renderer),
                }

                structFile.body = [
                    ...renderer.renderImports([statement], state),
                    ...structFile.body,
                ]

                result.push(structFile)
            },
        )

        namespace.services.forEach((statement: ServiceDefinition) => {
            const state: IRenderState = {
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: exportsForFile([statement]),
                project: thriftProject,
            }

            const serviceFile: IGeneratedFile = {
                type: 'GeneratedFile',
                name: statement.name.value,
                path: namespace.namespace.path,
                body: renderStatement(statement, state, renderer),
            }

            serviceFile.body = [
                ...renderer.renderImports([statement], state),
                ...serviceFile.body,
            ]

            result.push(serviceFile)
        })

        result.push({
            type: 'GeneratedFile',
            name: 'index',
            path: namespace.namespace.path,
            body: renderer.renderIndex({
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: {},
                project: thriftProject,
            }),
        })
    })

    return result
}
