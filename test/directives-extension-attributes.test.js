/**
 * This file is to test the following feature:
 *
 *    The applied directives reflects the attribute value of the custom element
 */

import test from 'tape'
import directiveApi from '..'
import { JSDOM } from 'jsdom-wc'
const window = (new JSDOM()).window
global.window = window
const { HTMLElement, customElements, document } = window

const actionsExecuted = Symbol('actionsExecuted')

const CUSTOM_ELEM_ATTR_CALLED_CB = 'custom element attribute changed'
const DIR_CONNECTED_CB = (directiveName) => `directive ${directiveName} connected callback`
const DIR_DISCONNECTED_CB = (directiveName) => `directive ${directiveName} disconnected callback`

class ElementWithObservedAttributes extends HTMLElement {
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
        this[actionsExecuted].push(CUSTOM_ELEM_ATTR_CALLED_CB)
        break
    }
  }
}

class ElementWithoutObservedAttributes extends HTMLElement {
  constructor (...args) {
    super(...args)
    this[actionsExecuted] = []
  }
}

class TestDirectiveWithName {
  constructor (directiveName) {
    this.directiveName = directiveName
  }

  connectedCallback () {
    this.ownerElement[actionsExecuted].push(DIR_CONNECTED_CB(this.directiveName))
  }

  disconnectedCallback () {
    this.ownerElement[actionsExecuted].push(DIR_DISCONNECTED_CB(this.directiveName))
  }
}

const ExtendedElementWithObservedAttributes = directiveApi.onAttribute('has').addDirectivesSupport(ElementWithObservedAttributes)

ExtendedElementWithObservedAttributes
  .defineDirective('dir1', new TestDirectiveWithName('dir1'))
  .defineDirective('dir2', new TestDirectiveWithName('dir2'))
  .defineDirective('dir3', new TestDirectiveWithName('dir3'))

customElements.define('x-test', ExtendedElementWithObservedAttributes)

const ExtendedElement = directiveApi.onAttribute('has').addDirectivesSupport(ElementWithoutObservedAttributes)

ExtendedElement
  .defineDirective('dir1', new TestDirectiveWithName('dir1'))
  .defineDirective('dir2', new TestDirectiveWithName('dir2'))
  .defineDirective('dir3', new TestDirectiveWithName('dir3'))

customElements.define('x-test-2', ExtendedElement)

test('directives extension test - check class extension observed attribute is concatenated if defined', t => {
  t.plan(1)
  t.deepEqual(ExtendedElementWithObservedAttributes.observedAttributes, ['has', 'test-attr'])
})

test('directives extension test - check class extension observed attribute is created if not defined', t => {
  t.plan(1)
  t.deepEqual(ExtendedElement.observedAttributes, ['has'])
})

test('directives extension test - check class extension not affecting original class attribute observers', t => {
  const elem = document.createElement('x-test')
  elem.setAttribute('has', 'dir1 dir2 dir3')

  document.body.appendChild(elem)

  let expectedExecutedActions = [
    DIR_CONNECTED_CB('dir1'),
    DIR_CONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3')
  ]

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('test-attr', '123')

  expectedExecutedActions.push(...[
    CUSTOM_ELEM_ATTR_CALLED_CB
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  document.body.removeChild(elem)

  expectedExecutedActions.push(...[
    DIR_DISCONNECTED_CB('dir3'),
    DIR_DISCONNECTED_CB('dir2'),
    DIR_DISCONNECTED_CB('dir1')
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)
  t.end()
})

test('directives extension test - chack class extension not affecting original class attribute observers', t => {
  const elem = document.createElement('x-test-2')
  elem.setAttribute('has', 'dir1 dir2 dir3')

  document.body.appendChild(elem)

  let expectedExecutedActions = [
    DIR_CONNECTED_CB('dir1'),
    DIR_CONNECTED_CB('dir2'),
    DIR_CONNECTED_CB('dir3')
  ]

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('test-attr', '123')
  // nothing happened in this case
  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  elem.setAttribute('has', 'dir1="a" dir2="b" dir3="c"')
  // nothing happened in this case
  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)

  document.body.removeChild(elem)

  expectedExecutedActions.push(...[
    DIR_DISCONNECTED_CB('dir3'),
    DIR_DISCONNECTED_CB('dir2'),
    DIR_DISCONNECTED_CB('dir1')
  ])

  t.deepEqual(elem[actionsExecuted], expectedExecutedActions)
  t.end()
})