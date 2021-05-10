'use strict';

const parser = require('@babel/parser');

const traverse = require('@babel/traverse').default;

const generator = require('@babel/generator').default;

const types = require('@babel/types');

const sourceFileName = 'testInCode.js';
const sourceCode =
  "\n  console.log(1)\n  function log(): number {\n    console.debug('before')\n    console.error(2)\n    console.debug('after')\n  }\n  log()\n  class Foo {\n    bar(): void {\n      console.log(3)\n    }\n    render() {\n      return <div></div>\n    }\n  }  \n";
const ast = parser.parse(sourceCode, {
  plugins: ['typescript', 'jsx'],
});
traverse(ast, {
  CallExpression(path) {
    const calleeStr = generator(path.node.callee).code;

    if (['console.log', 'console.error'].includes(calleeStr)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(
        types.stringLiteral(
          ''.concat(sourceFileName, '(').concat(line, ', ').concat(column, '):')
        )
      );
    }
  },
});
const { code, map } = generator(ast, {
  sourceMaps: true,
  sourceFileName,
});
console.log(code);
console.log(map);
