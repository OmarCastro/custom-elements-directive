import addDirectivesSupportOnAttributeValue from './src/directives-support.mixin'
import addDirectivesSupportUsingAttributes from './src/directives-support-attributes.mixin'

const API = {
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
