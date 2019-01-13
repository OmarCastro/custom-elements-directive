import test from 'tape'
import directiveApi from '..'
const { HTMLElement, customElements, document } = window

const testProp = Symbol('testProp')

class ElementWithProp extends HTMLElement {
  constructor (...args) {
    super(...args)
    this[testProp] = 'OK'
  }
}

const ExtendedElementWithProp = directiveApi.extend(ElementWithProp)

const isConnected = Symbol('isConnected')
const disconnectedOnce = Symbol('disconnectedOnce')
const directiveConnectedCalls = Symbol('connectedCalls')
const directiveDisconnectedCalls = Symbol('disconnectedCalls')

const testDirectivePrototype = {
  connectedCallback () {
    const { ownerElement } = this
    ownerElement[isConnected] = true
    ownerElement[disconnectedOnce] = ownerElement[disconnectedOnce] === true
    ownerElement[directiveConnectedCalls] = (ownerElement[directiveConnectedCalls] || 0) + 1
  },

  disconnectedCallback () {
    const { ownerElement } = this
    ownerElement[isConnected] = false
    ownerElement[disconnectedOnce] = true
    ownerElement[directiveDisconnectedCalls] = (ownerElement[directiveDisconnectedCalls] || 0) + 1
  }
}

ExtendedElementWithProp.defineDirective('test-directive', testDirectivePrototype)
ExtendedElementWithProp.defineDirective('dev-null-directive', {})

test('directives extension test - get map of defined directives', t => {
  t.plan(1)
  t.deepEqual(ExtendedElementWithProp.definedDirectives, {
    'test-directive': testDirectivePrototype,
    'dev-null-directive': {}
  })
})

test('directives extension test - throw error when trying to define a directive with an invalid name', t => {
  t.plan(3)
  t.throws(() => ExtendedElementWithProp.defineDirective([], testDirectivePrototype))
  try {
    ExtendedElementWithProp.defineDirective([], testDirectivePrototype)
  } catch (error) {
    t.equals(error.message, 'expected directive name to be a string')
  }

  // definedDirectives remains unchanged
  t.deepEqual(ExtendedElementWithProp.definedDirectives, {
    'test-directive': testDirectivePrototype,
    'dev-null-directive': {}
  })
})

test('directives extension test - throw error when trying to define a directive with an invalid property', t => {
  t.plan(3)
  t.throws(() => ExtendedElementWithProp.defineDirective('invalid-directive', null))
  try {
    ExtendedElementWithProp.defineDirective('invalid-directive', null)
  } catch (error) {
    t.equals(error.message, 'expected directive prototype to be an non null object')
  }

  // definedDirectives remains unchanged
  t.deepEqual(ExtendedElementWithProp.definedDirectives, {
    'test-directive': testDirectivePrototype,
    'dev-null-directive': {}
  })
})

test('directives extension test - throw error when trying to redefine a directive', t => {
  t.plan(3)
  t.throws(() => ExtendedElementWithProp.defineDirective('test-directive', testDirectivePrototype))
  try {
    ExtendedElementWithProp.defineDirective('test-directive', testDirectivePrototype)
  } catch (error) {
    t.equals(error.message, 'directive test-directive is already defined, cannot redefine directives')
  }

  // definedDirectives remains unchanged
  t.deepEqual(ExtendedElementWithProp.definedDirectives, {
    'test-directive': testDirectivePrototype,
    'dev-null-directive': {}
  })
})

customElements.define('x-test-attributes', ExtendedElementWithProp)

test('directives extension test - no directive applied when attribute is not appied', t => {
  const elem = document.createElement('x-test-attributes')
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property is not defined')
  document.body.removeChild(elem)
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property still not defined')
  document.body.removeChild(elem)
  t.end()
})

test('directives extension test - no directive applied when attribute is empty', t => {
  const elem = document.createElement('x-test-attributes')
  elem.setAttribute('has', '')
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property is not defined')
  document.body.removeChild(elem)
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property still not defined')
  document.body.removeChild(elem)
  t.end()
})

test('directives extension test - no directive applied when attribute contains no defined directive', t => {
  const elem = document.createElement('x-test-attributes')
  elem.setAttribute('has', 'unknown-directive')
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property is not defined')
  document.body.removeChild(elem)
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property still not defined')
  document.body.removeChild(elem)
  t.end()
})

test('directives extension test - no additional actions are executed when applying an directive that does nothing', t => {
  const elem = document.createElement('x-test-attributes')
  elem.setAttribute('has', 'dev-null-directive')
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property is not defined')
  document.body.removeChild(elem)
  document.body.appendChild(elem)
  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], undefined, 'isConnected property still not defined')
  document.body.removeChild(elem)
  t.end()
})

test('directives extension test - check directive connection callback are called correctly', t => {
  const elem = document.createElement('x-test-attributes')
  elem.setAttribute('test-directive', '')

  document.body.appendChild(elem)

  t.equals(elem[testProp], 'OK')
  t.equals(elem[isConnected], true, 'isConnected property after insertion on DOM')
  t.equals(elem[disconnectedOnce], false, 'disconnectedOnce property after insertion on DOM')
  t.equals(elem[directiveConnectedCalls], 1, 'directive connected callback called once after insertion on DOM')

  document.body.removeChild(elem)

  t.equals(elem[isConnected], false, 'isConnected property after removal on DOM')
  t.equals(elem[disconnectedOnce], true, 'disconnectedOnce property after removal on DOM')
  t.equals(elem[directiveDisconnectedCalls], 1, 'directive disconnected callback called once, on removal on DOM')

  document.body.appendChild(elem)

  t.equals(elem[isConnected], true, 'isConnected property after reinsert on DOM')
  t.equals(elem[disconnectedOnce], true, 'disconnectedOnce property after reinsert on DOM')
  t.equals(elem[directiveConnectedCalls], 2, 'directive connected callback called twice, first on the first insertion, second on reinsertion')
  t.equals(elem[directiveDisconnectedCalls], 1, 'directive disconnected callback still called once, on removal on DOM')

  document.body.removeChild(elem)

  t.end()
})
