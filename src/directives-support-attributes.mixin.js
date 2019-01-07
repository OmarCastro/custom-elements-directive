import { reloadDirectives, initializeDirectives, finalizeDirectives } from './directives-management'
/* global MutationObserver */

const attributesObserver = Symbol('attributesObserver')

function getParsedAttributesList (element) {
  return Array.from(element.attributes).map(attribute => ({ name: attribute.name, value: attribute.value }))
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

    disconnectedCallback () {
      finalizeDirectives(this)
      this[attributesObserver] && this[attributesObserver].disconnect()

      if (typeof super.disconnectedCallback === 'function') {
        super.disconnectedCallback()
      }
    }

    connectedCallback () {
      if (typeof super.connectedCallback === 'function') {
        super.connectedCallback()
      }
      const parsedAttributeList = getParsedAttributesList(this)
      initializeDirectives(this, parsedAttributeList, definedDirectives)
      if (this[attributesObserver] == null) {
        var observer = new MutationObserver(() => reloadDirectives(this, getParsedAttributesList(this), definedDirectives))
        this[attributesObserver] = observer
      }
      this[attributesObserver].observe(this, { attributeFilter: Object.keys(definedDirectives) })
      if (typeof super.directivesConnectedCallback === 'function') {
        super.directivesConnectedCallback()
      }
    }
  }

  Object.defineProperty(classWithDirectivesSupport, 'name', { value: targetElementClass.name })
  return classWithDirectivesSupport
}
