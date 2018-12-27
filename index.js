import addDirectivesSupport from './src/directives-support.mixin'

const API = {
  onAttribute (attribute) {
    return {
      addDirectivesSupport (targetClass) {
        return addDirectivesSupport(targetClass, attribute)
      }
    }
  }
}

export default API
