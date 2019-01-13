import addDirectivesSupportOnAttributeValue from './directives-support.mixin'
import addDirectivesSupportUsingAttributes from './directives-support-attributes.mixin'

function extend(targetClass, options){
  const { attribute } = Object.assign({}, options)
  return (typeof attribute === 'string' && attribute !== '')
    ? addDirectivesSupportOnAttributeValue(targetClass, attribute)
    : addDirectivesSupportUsingAttributes(targetClass)
}

function define(name, targetClass, options) {
  const customElementsOptions = Object.assign({}, options)
  const extendedElement = extend(targetClass, options)
  delete customElementsOptions.attribute
  customElements.define(name, extendedElement, customElementsOptions)
  return extendedElement
}

const API = {
  define,
  extend ,
  onAttribute (attribute) {
    return {
      define (name, targetClass, options) {
        return define(name, targetClass,  Object.assign({attribute}, options))
      },
      extend (targetClass, options) {
        return extend(targetClass,  Object.assign({attribute}, options))
      }
    }
  },
}

export default API
