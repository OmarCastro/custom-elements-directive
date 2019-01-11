import addDirectivesSupportOnAttributeValue from './directives-support.mixin'
import addDirectivesSupportUsingAttributes from './directives-support-attributes.mixin'

const API = {

  define (name, targetClass, options) {
    const customElementsOptions = Object.assign({}, options)
    const { attribute } = customElementsOptions
    delete customElementsOptions.attribute
    const extendedElement = (typeof attribute === 'string' && attribute !== '')
      ? addDirectivesSupportOnAttributeValue(targetClass, attribute)
      : addDirectivesSupportUsingAttributes(targetClass)

    customElements.define(name, extendedElement, customElementsOptions)
    return extendedElement
  },

  onAttribute (attribute) {
    return {
      addDirectivesSupport (targetClass) {
        return addDirectivesSupportOnAttributeValue(targetClass, attribute)
      }
    }
  },

  usingElementAttributes () {
    return {
      addDirectivesSupport: addDirectivesSupportUsingAttributes
    }
  }
}

API.usingElementAttributes.addDirectivesSupport = addDirectivesSupportUsingAttributes

export default API
