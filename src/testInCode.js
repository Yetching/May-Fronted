const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');

const sourceFileName = 'testInCode.js';
const sourceCode = `
  console.log(1)
  function log(): number {
    console.debug('before')
    console.error(2)
    console.debug('after')
  }
  const a = {
    name: 'li',
    age: 20
  }
  console.log(a?.name)
  log()
  class Foo {
    bar(): void {
      console.log(3)
    }
    render() {
      return <div></div>
    }
  }  
`;

const ast = parser.parse(sourceCode, {
  plugins: ['typescript', 'jsx'],
});

traverse(ast, {
  CallExpression(path) {
    const calleeStr = generator(path.node.callee).code;
    if (['console.log', 'console.error'].includes(calleeStr)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(
        types.stringLiteral(`${sourceFileName}(${line}, ${column}):`)
      );
    }
  },
});

const { code, map } = generator(ast, {
  sourceMaps: true,
  sourceFileName,
});

console.log(ast);

console.log(code);

console.log(map);
