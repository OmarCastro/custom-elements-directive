import test from 'tape'
import directiveApi from '../src/add-directives-support'
import { JSDOM } from 'jsdom-wc'
const window = (new JSDOM()).window
global.window = window
const { HTMLElement, customElements, document } = window

const testProp = Symbol('testProp')

class ElementWithProp extends HTMLElement {
  constructor (...args) {
    super(...args)
    this[testProp] = 'OK'
  }
}

class ElementWithConnectionCallbacks extends HTMLElement {
  constructor (...args) {
    super(...args)
    this._numOfConnectedCallbacksCalled = 0
    this._numODisconnectedCallbacksCalled = 1
  }

  connectedCallback () {
    this._numOfConnectedCallbacksCalled++
  }

  disconnectedCallback () {
    this._numOfConnectedCallbacksCalled++
  }
}

const ExtendedElementWithProp = directiveApi.fromAttribute('has').addDirectivesSupport(ElementWithProp)

const isConnected = Symbol('isConnected')
const disconnectedOnce = Symbol('disconnectedOnce')
const directiveConnectedCalls = Symbol('connectedCalls')
const directiveDisconnectedCalls = Symbol('disconnectedCalls')

ExtendedElementWithProp.defineDirective('test-directive', {
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
})
customElements.define('x-test', ExtendedElementWithProp)

test('directives extension test - check directive connection callback are called correctly', t => {
  const elem = document.createElement('x-test')
  elem.setAttribute('has', 'test-directive')

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

  t.end()
})
