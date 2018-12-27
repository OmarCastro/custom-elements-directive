import test from 'tape'
import directiveApi from '..'
import { JSDOM } from 'jsdom-wc'
const window = (new JSDOM()).window
global.window = window
const { HTMLElement, customElements, document } = window

const actionsExecuted = Symbol('actionsExecuted')

const CUSTOM_ELEM_CONNECTED_CB = 'custom element connected callback'
const CUSTOM_ELEM_DIRS_CONNECTED_CB = 'custom element directives connected callback'
const CUSTOM_ELEM_DISCONNECTED_CB = 'custom element disconnected callback'
const DIR_CONNECTED_CB = (directiveName) => `directive ${directiveName} connected callback`
const DIR_DISCONNECTED_CB = (directiveName) => `directive ${directiveName} disconnected callback`

class ElementWithConnectionCallbacks extends HTMLElement {
  constructor (...args) {
    super(...args)
    this[actionsExecuted] = []
  }

  connectedCallback () {
    this[actionsExecuted].push(CUSTOM_ELEM_CONNECTED_CB)
  }

  directivesConnectedCallback () {
    this[actionsExecuted].push(CUSTOM_ELEM_DIRS_CONNECTED_CB)
  }

  disconnectedCallback () {
    this[actionsExecuted].push(CUSTOM_ELEM_DISCONNECTED_CB)
  }
}

function testDirectiveWithName (directiveName) {
  return {
    connectedCallback () {
      this.ownerElement[actionsExecuted].push(DIR_CONNECTED_CB(directiveName))
    },

    disconnectedCallback () {
      this.ownerElement[actionsExecuted].push(DIR_DISCONNECTED_CB(directiveName))
    }
  }
}

const ExtendedElement = directiveApi.onAttribute('has').addDirectivesSupport(ElementWithConnectionCallbacks)

ExtendedElement
  .defineDirective('dir1', testDirectiveWithName('dir1'))
  .defineDirective('dir2', testDirectiveWithName('dir2'))
  .defineDirective('dir3', testDirectiveWithName('dir3'))
  
customElements.define('x-test', ExtendedElement)

test('directives extension test - check directive connection callback are called in correct order', t => {
  const elem = document.createElement('x-test')
  elem.setAttribute('has', 'dir1 dir2 dir3')

  document.body.appendChild(elem)

  t.deepEqual(elem[actionsExecuted], [
    CUSTOM_ELEM_CONNECTED_CB,
    DIR_CONNECTED_CB('dir1'),
    DIR_CONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3'),
    CUSTOM_ELEM_DIRS_CONNECTED_CB
  ])

  document.body.removeChild(elem)

  t.deepEqual(elem[actionsExecuted], [
    CUSTOM_ELEM_CONNECTED_CB,
    DIR_CONNECTED_CB('dir1'),
    DIR_CONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3'),
    CUSTOM_ELEM_DIRS_CONNECTED_CB,
    DIR_DISCONNECTED_CB('dir3'),
    DIR_DISCONNECTED_CB('dir2'),
    DIR_DISCONNECTED_CB('dir1'),
    CUSTOM_ELEM_DISCONNECTED_CB
  ])

  t.end()
})
