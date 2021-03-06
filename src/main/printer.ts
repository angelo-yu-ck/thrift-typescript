import * as ts from 'typescript'
const pkg = require('../../package.json')

const tslintDisable: string = ' tslint:disable '

const prefaceComment: string = `
 * Autogenerated by @creditkarma/thrift-typescript v${pkg.version}
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
`

function generatePreface(req: ts.Statement): void {
    ts.addSyntheticLeadingComment(
        req,
        ts.SyntaxKind.MultiLineCommentTrivia,
        tslintDisable,
        true,
    )

    ts.addSyntheticLeadingComment(
        req,
        ts.SyntaxKind.MultiLineCommentTrivia,
        prefaceComment,
        true,
    )
}

export function print(
    statements: Array<ts.Statement>,
    includePreface: boolean = false,
): string {
    const printer: ts.Printer = ts.createPrinter()
    const rawSourceFile: ts.SourceFile = ts.createSourceFile(
        'thrift.ts',
        '',
        ts.ScriptTarget.ES2015,
        false,
        ts.ScriptKind.TS,
    )

    const bodyFile: ts.SourceFile = ts.updateSourceFileNode(
        rawSourceFile,
        statements,
    )

    if (includePreface && statements.length > 0) {
        generatePreface(statements[0])
    } else {
        console.warn(`Printing empty file`)
    }

    return printer.printBundle(ts.createBundle([bodyFile]))
}
