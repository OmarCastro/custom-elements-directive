Custom elements directives &middot; [![npm](https://img.shields.io/npm/v/custom-elements-directives.svg?style=flat-square)](https://www.npmjs.com/package/custom-elements-directives) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT) [![Build Status](https://img.shields.io/travis/OmarCastro/custom-elements-directives/master.svg?style=flat-square)](https://travis-ci.org/OmarCastro/custom-elements-directives) [![Code Coverage](https://img.shields.io/codecov/c/github/OmarCastro/custom-elements-directives.svg?style=flat-square)](https://codecov.io/gh/OmarCastro/custom-elements-directives)
------

Custom elements directives is a Javascript library that adds directives support to custom elements

Elements directives are re-usable pieces of logic that can be used to extend elements functionality.



#### Installation

#### `npm i custom-elements-directives --save`

#### Usage
```Javascript
import {customElementMixin} from "custom-elements-directives" 

class ACustomElement extends HTMLElement {

  connectedCallback(){
    console.log("element connected")

  }

  disconnectedCallback(){
    console.log("element disconnected")
  }
}

const ExtendedElement = customElementMixin.onAttribute("features").addDirectivesSupport(ACustomElement)

ExtendedElement.defineDirective("logs-stuff", {
  connectedCallback(){
    console.log("directive connected")
  }

  disconnectedCallback(){
    console.log("directive disconnected")
  }
})

customElements.define('custom-element', ExtendedElement)

const elem = document.createElement('custom-element')
elem.setAttribute('features', 'logs-stuff')
document.body.appendChild(elem)
// element connected
// directive connected
document.body.removeChild(elem)
// directive disconnected
// element disconnected
```
