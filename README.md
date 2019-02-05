Custom elements directives &middot; [![npm](https://img.shields.io/npm/v/custom-elements-directives.svg?style=flat-square)](https://www.npmjs.com/package/custom-elements-directives) [![License: MIT](https://img.shields.io/github/license/OmarCastro/custom-elements-directive.svg?color=blue&style=flat-square)](https://opensource.org/licenses/MIT) [![Build Status](https://img.shields.io/travis/OmarCastro/custom-elements-directives/master.svg?style=flat-square&logo=travis)](https://travis-ci.org/OmarCastro/custom-elements-directives) [![Code Coverage](https://img.shields.io/codecov/c/github/OmarCastro/custom-elements-directives.svg?style=flat-square&logo=codecov)](https://codecov.io/gh/OmarCastro/custom-elements-directives)
------

Custom elements directives is a Javascript library that adds directives support to custom elements

A directive in this case is an instruction to give to an element as to make a specific logic. It is used to break the logic in smaller pieces as to make the element more maintainable. It can also be used to extend the functionality of an element to a specific use case without the need to change the original logic of the custom element. 



#### Installation

#### `npm i custom-elements-directives --save`

#### Usage
The next code shows a basic usage of the directives library

```Javascript
import customElementDirectives from "custom-elements-directives" 

class ACustomElement extends HTMLElement {

  connectedCallback(){
    console.log("element connected")
  }

  disconnectedCallback(){
    console.log("element disconnected")
  }
}

const loggerDirective = {
  connectedCallback(){
    console.log(`directive ${this.directive.name} connected`)
  }

  disconnectedCallback(){
    console.log(`directive ${this.directive.name} disconnected`)
  }
}



// You define a custom element directive the same way you define a custom element
customElementDirectives.define('custom-element', ACustomElement)
  .defineDirective('logs-stuff', loggerDirective)

const element = document.createElement('custom-element')
// to apply the directive just add the attribute to the element
element.setAttribute('logs-stuff', '')
document.body.appendChild(element)
// "element connected" will be logged in the console, then
// "directive logs-stuff connected" will be logged in the console
document.body.removeChild(element)
// "directive logs-stuff disconnected" will be logged in the console, then
// "element disconnected" will be logged in the console


// If you want that the applied directives to reflect the value of an element attribute  
// use the "attribute" option
customElementDirectives.define('custom-element-attribute', ACustomElement, { attribute: 'features' })
  .defineDirective('logs-stuff', loggerDirective)

const element2 = document.createElement('custom-element-attribute')
// to apply the directive you need to add the attribute apllied and add the name of the directiveyou want to apply
element2.setAttribute('features', 'logs-stuff')
document.body.appendChild(element2)
// "element connected" will be logged in the console, then
// "directive logs-stuff connected" will be logged in the console
document.body.removeChild(element2)
// "directive logs-stuff disconnected" will be logged in the console, then
// "element disconnected" will be logged in the console


// If you wish only to extend the class to add support to directives
// use extend method
const ExtendedClass = customElementDirectives.extend(ACustomElement, { attribute: 'has' })
  .defineDirective('stuff-logger', loggerDirective)
customElements.define('custom-element-extended', ExtendedClass)

const element3 = document.createElement('custom-element-extended')
// to apply the directive you need to add the attribute apllied and add the name of the directiveyou want to apply
element3.setAttribute('has', 'stuff-logger')
document.body.appendChild(element3)
// "element connected" will be logged in the console, then
// "directive stuff-logger connected" will be logged in the console
document.body.removeChild(element3)
// "directive stuff-logger disconnected" will be logged in the console, then
// "element disconnected" will be logged in the console
```


#### API

##### customElementDirectives.extend(targetClass, options)

This method extends the class and returns the extended class. The extended class is essentially a subclass of the targetClass, so the targetClass suffers no side effects. It accepts the following parameters:

 - **targetClass**: The target class that will be used to create the extended class.
 - **options**: an optional parameter, the extension option. If applied the option parameter should be object with the extension options. The only property that is supports is `attribute`. If the property is present, the directives applied will reflect the value applied in the defined attribute value, otherwise it will reflect on the attributes in the elmenet.


##### customElementDirectives.define(name, options)

A wrapper around `customElements.define` where the class is extended to add directives support. It accepts the following parameters:

  - **name**: the name of the directive
  - **options**: just like the second parameter of `customElements.define`, this parameter is an object that contains the propertes used in `customElements.define` plus the optional property `attribute` of the `extend` method


##### customElementDirectives.onAttribute(name)

Applies currying to the API functions `define` and `extends`, for reusability purposes. Useful if you want to create a rule where the directives are applied. You can define a module like

```Javascript
/* file: customized-api.js  */
import customElementDirectives from "custom-elements-directives"
/* Rule X: all extensions of the elmenents must be defined on the "plugin" attribute    */ 
export default customElementDirectives.onAttribute("plugins")
```

And then you can import the created module instead of importing this lib:

```Javascript
import customElementDirectives from "./path/to/customized-api"

...

// will be the same as `customElementDirectives.extend(ACustomElement, { attribute: 'plugins' })`
const ExtendedClass = customElementDirectives.extend(ACustomElement)

...
// will be the same as `customElementDirectives.define('custom-element-abc', ACustomElement2, { attribute: 'plugins' })`
customElementDirectives.define('custom-element-abc', ACustomElement2)

...
```

### ExtendedClass.defineDirective(name, directive)

Defines a directive with the name `name` on the element


## Diretive Structure

A directive should represent an object that will use as prototype object of the directive.

```Javascript

{
  connectedCallback: Function;
  disconnectedCallback: Function;
  valueChanged: Function;
}

```

However, the directive instance will have the schema on the next figure, you can access the intance using the `this` keyword.

```Javascript

{
  connectedCallback: Function;
  disconnectedCallback: Function;
  valueChanged: Function;
  ownerElement: HTMLElement
  directive: {
    name: string
    value: string
  }
}

```

#### Directive.connectedCallback()

This callback is called when element is added to the DOM document with the fulfilled conditions to apply the directive, or when the condition to apply the element in the DOM fulfills.

The conditions to apply the elements are as described previously: attribute with the directive name on the element; or the attribute used to apply directives contains the directive name 

#### Directive.disconnectedCallback()
This callback is called when element with the applied directive is removed to the DOM, or when the element loses the condition to apply the element in the DOM (e.g. attribute removed).

#### Directive.valueChanged()
This callback is called when the directive value changed. 

If the element does not use an attribute to defined the directive, the value reflect the value in the element attribute.

```HTML
<custom-element attribute-name="attribute-value"/>
```
Otherwise, you can apply the value to a directive by appending the sign `=` to the attribute name.


```HTML
<custom-element directives="attribute-name='attribute-value'"/>
```

#### Directive.ownerElement
element where the element directive is applied

#### Directive.directive.name
name of the directive, same as `name` on `ExtendedClass.defineDirective(name, directive)`

#### Directive.directive.value
value applied to the directive, see `Directive.valueChanged()`