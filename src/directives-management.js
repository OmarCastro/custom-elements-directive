const appliedDirectivesProp = Symbol('appliedDirectives')
const directivesReloadEnabled = Symbol('directivesReloadEnabled')

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

function connectDirectives (directiveInstanceList) {
  for (const instance of directiveInstanceList) {
    typeof instance.connectedCallback === 'function' && instance.connectedCallback()
  }
}

function disconnectDirectives (directiveInstanceList) {
  for (let i = directiveInstanceList.length - 1; i >= 0; i--) {
    const instance = directiveInstanceList[i]
    typeof instance.disconnectedCallback === 'function' && instance.disconnectedCallback()
  }
}

export function reloadDirectives (element, parsedAttributeList, definedDirectives) {
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

export function initializeDirectives (element, parsedAttributeList, definedDirectives) {
  const appliedDirectives = constructDirectives(element, parsedAttributeList, definedDirectives)
  connectDirectives(appliedDirectives)
  element[appliedDirectivesProp] = appliedDirectives
  element[directivesReloadEnabled] = true
}

export function finalizeDirectives (element) {
  disconnectDirectives(element[appliedDirectivesProp])
  element[appliedDirectivesProp] = []
  element[directivesReloadEnabled] = false
}

export function isDirectivesReloadEnabledOnElement (element) {
  return element[directivesReloadEnabled] === true
}
