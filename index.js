import addDirectivesSupport from './src/directives-support.mixin'

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
