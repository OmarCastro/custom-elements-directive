const whiteSpaceRegex = /\s/
const attributeCharRegex = /[a-zA-Z0-9\-:_]/
export default function parseAttributeValue (text) {
  const NONE = 0
  const DIRECTIVE_NAME = 1
  const DIRECTIVE_PARAM = 2
  const DIRECTIVE_PARAM_SINGLE_QUOTE = 3
  const DIRECTIVE_PARAM_DOUBLE_QUOTE = 4

  let state = NONE
  let charPosition = -1
  const attributes = {}
  let directiveName = ''
  let directiveParam = ''
  let escapingChar = false

  function pushAttribute () {
    attributes[directiveName] = directiveParam
    directiveName = ''
    directiveParam = ''
  }

  function parseFailureMessage (errorMsg) {
    return [
      `Error: ${errorMsg}`,
      `at: ${text}`,
      `    ${'-'.repeat(charPosition) + '^'}`].join('\n')
  }

  for (const char of text) {
    charPosition++
    switch (state) {
      case NONE:
        if (whiteSpaceRegex.test(char)) {
          continue
        }
        if (attributeCharRegex.test(char)) {
          state = DIRECTIVE_NAME
          directiveName += char
          continue
        }
        throw Error(parseFailureMessage('Directive name must contain only alphanumeric, dash, colon or underscore charaters'))
      case DIRECTIVE_NAME:
        if (whiteSpaceRegex.test(char)) {
          state = NONE
          pushAttribute()
          continue
        }
        if (attributeCharRegex.test(char)) {
          directiveName += char
          continue
        }
        if (char === '=') {
          state = DIRECTIVE_PARAM
          continue
        }
        throw Error(parseFailureMessage('Directive name must contain only alphanumeric, dash, colon or underscore charaters'))
      case DIRECTIVE_PARAM:
        if (escapingChar) {
          directiveParam += char
          escapingChar = false
          continue
        }
        if (whiteSpaceRegex.test(char)) {
          state = NONE
          pushAttribute()
          continue
        }
        if (char === '\\') {
          escapingChar = true
          continue
        }
        if (char === "'") {
          state = DIRECTIVE_PARAM_SINGLE_QUOTE
          continue
        }
        if (char === '"') {
          state = DIRECTIVE_PARAM_DOUBLE_QUOTE
          continue
        }
        directiveParam += char
        break
      case DIRECTIVE_PARAM_SINGLE_QUOTE:
        if (escapingChar) {
          directiveParam += char
          escapingChar = false
          continue
        }
        if (char === "'") {
          state = DIRECTIVE_PARAM
          continue
        }
        if (char === '\\') {
          escapingChar = true
          continue
        }
        directiveParam += char
        break
      case DIRECTIVE_PARAM_DOUBLE_QUOTE:
        if (escapingChar) {
          directiveParam += char
          escapingChar = false
          continue
        }
        if (char === '"') {
          state = DIRECTIVE_PARAM
          continue
        }
        if (char === '\\') {
          escapingChar = true
          continue
        }
        directiveParam += char
        break
    };
  }
  pushAttribute()
  return attributes
}
