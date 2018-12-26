import parseAttributeValue from './parser'

const appliedDirectivesProp = Symbol('appliedDirectives')

function connectDirectives (element, targetAttributeName, definedDirectives) {
  const attributeWithDirectives = element.getAttribute(targetAttributeName)
  const parsedAttributeMap = attributeWithDirectives ? parseAttributeValue(attributeWithDirectives) : {}
  const appliedDirectives = []
  element[appliedDirectivesProp] = appliedDirectives

  for (const [key, value] of Object.entries(parsedAttributeMap)) {
    if (definedDirectives[key]) {
      const directiveInstance = Object.create(definedDirectives[key])
      directiveInstance.ownerElement = element
      directiveInstance.directive = { name: key, value }
      appliedDirectives.push(directiveInstance)
    }
  }
  for (const directiveInstance of element[appliedDirectivesProp]) {
    if (typeof directiveInstance.connectedCallback === 'function') {
      directiveInstance.connectedCallback()
    }
  }
}

function disconnectDirectives (element) {
  const appliedDirectives = element[appliedDirectivesProp] || []
  for (let i = appliedDirectives.length - 1; i >= 0; i--) {
    const directiveInstance = appliedDirectives[i]
    if (typeof directiveInstance.disconnectedCallback === 'function') {
      directiveInstance.disconnectedCallback()
    }
  }
  element[appliedDirectivesProp] = []
}

function addDirectivesSupport (targetElementClass, targetAttributeName) {
  const definedDirectives = {}

  class classWithDirectivesSupport extends targetElementClass {
    static get definedDirectives () {
      return Object.assign({}, definedDirectives)
    }

    static defineDirective (directiveName, directivePrototype) {
      if (typeof directiveName !== 'string') {
        throw Error('expected directive name to be a string')
      } if (directivePrototype == null) {
        throw Error('expected directive prototype to be an object')
      } else if (definedDirectives[directiveName] != null) {
        throw Error(`directive ${directiveName} is already defined, cannot redefine directives`)
      }
      definedDirectives[directiveName] = directivePrototype
      return this
    }

    disconnectedCallback () {
      disconnectDirectives(this)
      if (typeof super.disconnectedCallback === 'function') {
        super.disconnectedCallback()
      }
    }

    connectedCallback () {
      if (typeof super.connectedCallback === 'function') {
        super.connectedCallback()
      }
      connectDirectives(this, targetAttributeName, definedDirectives)
      if (typeof super.directivesConnectedCallback === 'function') {
        super.directivesConnectedCallback()
      }
    }
  }

  Object.defineProperty(classWithDirectivesSupport, 'name', { value: targetElementClass.name })
  return classWithDirectivesSupport
}

const API = {
  fromAttribute (attribute) {
    return {
      addDirectivesSupport (targetClass) {
        return addDirectivesSupport(targetClass, attribute)
      }
    }
  }
}

export default API
