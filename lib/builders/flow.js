const bt = require('@babel/types')
const { default: generate } = require('@babel/generator')
const { BaseBuilder, smartComment, ARRAY_OF_LITERAL } = require('./base')
/*:: const { Union, Type, Field } = require('../store')*/


class FlowBuilder extends BaseBuilder {
  buildUnion(union/*: Union*/) {
    const ast = bt.declareTypeAlias(
      bt.identifier(union.name),
      undefined,
      bt.unionTypeAnnotation(union.variants.map((name) => bt.identifier(name)))
    )

    ast.leadingComments = [smartComment(union.description || '', union.links)]
    return ast
  }

  buildType(type/*: Type*/) {
    const fields = Object.keys(type.fields).map((field) => this.buildField(type.fields[field]))
    const ast = bt.declareTypeAlias(
      bt.identifier(type.name),
      undefined,
      bt.objectTypeAnnotation(fields),
    )

    ast.leadingComments = [smartComment(type.description || '', type.links)]
    return ast
  }

  buildField(field/*: Field*/) {
    const ast = bt.objectTypeProperty(
      bt.identifier(field.name),
      this.buildNativeType(field.type)
    )

    ast.optional = field.optional
    ast.leadingComments = [smartComment(field.description || '', field.links)]
    return ast
  }

  buildInteger() {
    return bt.numberTypeAnnotation()
  }

  buildFloat() {
    return this.buildInteger()
  }

  buildString() {
    return bt.stringTypeAnnotation()
  }

  buildBoolean() {
    return bt.booleanTypeAnnotation()
  }

  buildBooleanLiteral(value/*: boolean*/) {
    return bt.booleanLiteral(value)
  }

  buildReference/*::<T>*/(name/*: T*/)/*: T*/ {
    return bt.genericTypeAnnotation(bt.identifier(name))
  }

  buildArrayType(typeName/*: string*/) {
    return bt.arrayTypeAnnotation(this.buildNativeType(typeName.substr(ARRAY_OF_LITERAL.length)))
  }

  buildModule(types/*: mixed[]*/)/*: mixed[]*/ {
    return [bt.declareModule(bt.stringLiteral('telegram-typings'), bt.blockStatement(types))]
  }

  buildProgram(body) {
    return generate(bt.program(body, [], 'module'))
  }
}

module.exports = {
  FlowBuilder,
}

