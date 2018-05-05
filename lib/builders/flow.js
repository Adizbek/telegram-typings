const bt = require('@babel/types')
const { default: generate } = require('@babel/generator')
const { AbstractJsBuilder } = require('./abstract-js')
const { ARRAY_OF_LITERAL } = require('./base')
/*:: const { Union, Interface, Method, Field } = require('../store')*/


class FlowBuilder extends AbstractJsBuilder {
  buildUnion(object/*: Union*/) {
    const variants = object.variants.map((name) => bt.genericTypeAnnotation(bt.identifier(name)))
    const ast = bt.declareTypeAlias(
      bt.identifier(object.name),
      undefined,
      bt.unionTypeAnnotation(variants)
    )

    ast.leadingComments = this.buildComments(object.description || '', object.links)
    return ast
  }

  buildUnionOfTypes(types/*: Array<string>*/) {
    return bt.unionTypeAnnotation(types.map((name) => this.buildNativeType(name)))
  }

  buildInterface(object/*: Interface*/) {
    const fields = Object.keys(object.fields)
      .map((fieldName) => this.buildField(object.fields[fieldName]))
    const ast = bt.declareTypeAlias(
      bt.identifier(object.name),
      undefined,
      bt.objectTypeAnnotation(fields),
    )

    ast.leadingComments = this.buildComments(object.description || '', object.links)

    return ast
  }

  buildMethod(object/*: Method*/) {
    const args = Object.keys(object.fields)
      .map((fieldName) => this.buildField(object.fields[fieldName]))

    const id = bt.identifier(object.name)

    id.typeAnnotation = bt.typeAnnotation(bt.functionTypeAnnotation(
      null,
      [
        // We should be able to leave the first argument as `null` for
        // the argument name to be stripped out. For some reason, though,
        // it has to be specified or output is broken
        bt.functionTypeParam(bt.identifier('json'), bt.objectTypeAnnotation(args)),
      ],
      null,
      // TODO: Support return types for methods
      bt.anyTypeAnnotation()
    ))
    const ast = bt.declareFunction(id)

    ast.leadingComments = this.buildComments(object.description || '', object.links)

    return ast
  }

  buildField(object/*: Field*/) {
    const ast = bt.objectTypeProperty(
      bt.identifier(object.name),
      this.buildNativeType(object.type)
    )

    ast.optional = object.optional
    ast.leadingComments = this.buildComments(object.description || '', object.links)

    return ast
  }

  buildArrayOfType(type/*: string*/) {
    return bt.arrayTypeAnnotation(this.buildNativeType(type.substr(ARRAY_OF_LITERAL.length)))
  }

  buildInteger() {
    return bt.numberTypeAnnotation()
  }

  buildString() {
    return bt.stringTypeAnnotation()
  }

  buildBoolean() {
    return bt.booleanTypeAnnotation()
  }

  buildBooleanLiteral(value/*: boolean*/) {
    const ast = bt.booleanLiteralTypeAnnotation()

    ast.value = value

    return ast
  }

  buildReference(type/*: any*/)/*: any*/ {
    return bt.genericTypeAnnotation(bt.identifier(type))
  }

  buildModule(types/*: mixed[]*/)/*: mixed[]*/ {
    return [bt.declareModule(bt.stringLiteral('telegram-typings'), bt.blockStatement(types))]
  }

  buildProgram(body/*: any*/) {
    return generate(bt.program(body, [], 'module'))
  }
}

module.exports = {
  FlowBuilder,
}
