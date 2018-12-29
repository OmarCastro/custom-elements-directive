import parseAttributeValue from './parser'

const appliedDirectivesProp = Symbol('appliedDirectives')
const directivesReloadEnabled = Symbol('directivesReloadEnabled')

function getParsedAttributesList (targetAttributeValue) {
  return targetAttributeValue ? parseAttributeValue(targetAttributeValue) : []
}

function constructDirectives (element, parsedAttributeList, definedDirectives) {
  const result = []
  for (const { name, value } of parsedAttributeList) {
    if (definedDirectives[name]) {
      const directiveInstance = Object.create(definedDirectives[name])
      directiveInstance.ownerElement = element
      directiveInstance.directive = { name, value }
      result.push(directiveInstance)
    }
  }
  return result
}

function reloadDirectives (element, targetAttributeValue, definedDirectives) {
  const parsedAttributeList = getParsedAttributesList(targetAttributeValue)
  const appliedDirectives = element[appliedDirectivesProp]
  const parsedAttributeListLength = parsedAttributeList.length
  const appliedDirectivesLength = appliedDirectives.length
  for (let i = 0; i < appliedDirectivesLength; i++) {
    if (parsedAttributeListLength === i) {
      disconnectDirectives(appliedDirectives.slice(i))
      element[appliedDirectivesProp] = appliedDirectives.slice(0, i)
      return
    }
    const directiveInstance = appliedDirectives[i]
    const parsedAttribute = parsedAttributeList[i]
    if (directiveInstance.directive.name !== parsedAttribute.name) {
      disconnectDirectives(appliedDirectives.slice(i))
      const newDirectives = constructDirectives(element, parsedAttributeList.slice(i), definedDirectives)
      connectDirectives(newDirectives)
      element[appliedDirectivesProp] = appliedDirectives.slice(0, i).concat(newDirectives)
      return
    } else if (directiveInstance.directive.value !== parsedAttribute.value) {
      if (typeof directiveInstance.valueChanged === 'function') {
        directiveInstance.valueChanged()
      }
      directiveInstance.directive.value = parsedAttribute.value
    }
  }
  if (parsedAttributeListLength > appliedDirectivesLength) {
    const newDirectives = constructDirectives(element, parsedAttributeList.slice(appliedDirectivesLength), definedDirectives)
    connectDirectives(newDirectives)
    element[appliedDirectivesProp] = appliedDirectives.concat(newDirectives)
  }
}

function connectDirectives (directiveList) {
  for (const directiveInstance of directiveList) {
    if (typeof directiveInstance.connectedCallback === 'function') {
      directiveInstance.connectedCallback()
    }
  }
}

function disconnectDirectives (directiveList) {
  for (let i = directiveList.length - 1; i >= 0; i--) {
    const directiveInstance = directiveList[i]
    if (typeof directiveInstance.disconnectedCallback === 'function') {
      directiveInstance.disconnectedCallback()
    }
  }
}

function initializeDirectives (element, targetAttributeName, definedDirectives) {
  const parsedAttributeList = getParsedAttributesList(element.getAttribute(targetAttributeName))
  const appliedDirectives = constructDirectives(element, parsedAttributeList, definedDirectives)
  connectDirectives(appliedDirectives)
  element[appliedDirectivesProp] = appliedDirectives
  element[directivesReloadEnabled] = true
}

function finalizeDirectives (element) {
  disconnectDirectives(element[appliedDirectivesProp])
  element[appliedDirectivesProp] = []
  element[directivesReloadEnabled] = false
}

export default function addDirectivesSupport (targetElementClass, targetAttributeName) {
  const definedDirectives = {}

  class classWithDirectivesSupport extends targetElementClass {
    static get definedDirectives () {
      return Object.assign({}, definedDirectives)
    }

    static defineDirective (directiveName, directivePrototype) {
      if (typeof directiveName !== 'string') {
        throw Error('expected directive name to be a string')
      } if (directivePrototype == null) {
        throw Error('expected directive prototype to be an non null object')
      } else if (definedDirectives[directiveName] != null) {
        throw Error(`directive ${directiveName} is already defined, cannot redefine directives`)
      }
      definedDirectives[directiveName] = directivePrototype
      return this
    }

    static get observedAttributes () {
      if (Array.isArray(super.observedAttributes)) {
        return [targetAttributeName].concat(super.observedAttributes)
      } else {
        return [targetAttributeName]
      }
    }

    attributeChangedCallback (name, oldValue, newValue) {
      switch (name) {
        case targetAttributeName:
          if (this[directivesReloadEnabled]) {
            reloadDirectives(this, newValue, definedDirectives)
          }
          break
        default:
          if (typeof super.attributeChangedCallback === 'function') {
            super.attributeChangedCallback(name, oldValue, newValue)
          }
          break
      }
    }

    disconnectedCallback () {
      finalizeDirectives(this)
      if (typeof super.disconnectedCallback === 'function') {
        super.disconnectedCallback()
      }
    }

    connectedCallback () {
      if (typeof super.connectedCallback === 'function') {
        super.connectedCallback()
      }
      initializeDirectives(this, targetAttributeName, definedDirectives)
      if (typeof super.directivesConnectedCallback === 'function') {
        super.directivesConnectedCallback()
      }
    }
  }

  Object.defineProperty(classWithDirectivesSupport, 'name', { value: targetElementClass.name })
  return classWithDirectivesSupport
}
