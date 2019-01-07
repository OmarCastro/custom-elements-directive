/**
 * This file tests the following features:
 *
 *    The connectCallback methods of custom elements and directives are executed in the following order:
 *      1. custom element "connectedCallback" method
 *      2. applied directives "connectedCallback" method in left-to-rigth order
 *      3. custom element "directivesConnectedCallback" method
 *
 *    The disconnectedCallback methods of custom elements and directives are executed in the following order:
 *      1. applied directives "disconnectedCallback" method in rigth-to-left order
 *      2. custom element "disconnectedCallback" method
 */

import test from 'tape'
import directiveApi from '..'
import window from './setup'
const { HTMLElement, customElements, document } = window

const actionsExecuted = Symbol('actionsExecuted')

const CUSTOM_ELEM_CONNECTED_CB = 'custom element connected callback'
const CUSTOM_ELEM_DIRS_CONNECTED_CB = 'custom element directives connected callback'
const CUSTOM_ELEM_DISCONNECTED_CB = 'custom element disconnected callback'
const DIR_CONNECTED_CB = (directiveName) => `directive ${directiveName} connected callback`
const DIR_DISCONNECTED_CB = (directiveName) => `directive ${directiveName} disconnected callback`
const DIR_VALUE_CHANGED_CB = (directiveName) => `directive ${directiveName} value changed`

class ElementWithConnectionCallbacks extends HTMLElement {
  constructor (...args) {
    super(...args)
    this[actionsExecuted] = []
  }

  static get observedAttributes () {
    return ['test-attr']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'test-attr':
        break
    }
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

class TestDirectiveWithName {
  constructor (directiveName) {
    this.directiveName = directiveName
  }

  valueChanged () {
    this.ownerElement[actionsExecuted].push(DIR_VALUE_CHANGED_CB(this.directiveName))
  }

  connectedCallback () {
    this.ownerElement[actionsExecuted].push(DIR_CONNECTED_CB(this.directiveName))
  }

  disconnectedCallback () {
    this.ownerElement[actionsExecuted].push(DIR_DISCONNECTED_CB(this.directiveName))
  }
}

const ExtendedElement = directiveApi.onAttribute('has').addDirectivesSupport(ElementWithConnectionCallbacks)

ExtendedElement
  .defineDirective('dir1', new TestDirectiveWithName('dir1'))
  .defineDirective('dir2', new TestDirectiveWithName('dir2'))
  .defineDirective('dir3', new TestDirectiveWithName('dir3'))

customElements.define('x-test-order', ExtendedElement)

test('directives extension test - check directive connection callback are called in correct order', t => {
  const elem = document.createElement('x-test-order')
  elem.setAttribute('has', 'dir1 dir2 dir3')

  document.body.appendChild(elem)

  let expectedExecutedActions = [
    CUSTOM_ELEM_CONNECTED_CB,
    DIR_CONNECTED_CB('dir1'),
    DIR_CONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3'),
    CUSTOM_ELEM_DIRS_CONNECTED_CB
  ]

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('has', 'dir1 dir2')

  expectedExecutedActions.push(...[
    DIR_DISCONNECTED_CB('dir3')
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('has', 'dir1=value dir2')
  elem.setAttribute('test-attr', 'dir1=value dir2')

  expectedExecutedActions.push(...[
    DIR_VALUE_CHANGED_CB('dir1')
  ])

  elem.setAttribute('has', 'dir1 dir2 dir3')

  expectedExecutedActions.push(...[
    DIR_VALUE_CHANGED_CB('dir1'),
    DIR_CONNECTED_CB('dir3')
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('has', 'dir1 dir3')

  expectedExecutedActions.push(...[
    DIR_DISCONNECTED_CB('dir3'),
    DIR_DISCONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3')
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  document.body.removeChild(elem)

  expectedExecutedActions.push(...[
    DIR_DISCONNECTED_CB('dir3'),
    DIR_DISCONNECTED_CB('dir1'),
    CUSTOM_ELEM_DISCONNECTED_CB
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)
  t.end()
})
