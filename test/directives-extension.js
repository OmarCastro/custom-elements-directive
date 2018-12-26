import test from 'tape'
import directiveApi from '../src/add-directives-support'
import { JSDOM } from "jsdom-wc";
import { disconnect } from 'cluster';
const window = (new JSDOM()).window;
global.window = window
const { HTMLElement, customElements, document } = window;

const testProp = Symbol("testProp")

class ElementWithProp extends HTMLElement {
    constructor(...args){
        super(...args);
        this[testProp] = "OK"
    }
}

class ElementWithConnectionCallbacks extends HTMLElement {
    constructor(...args){
        super(...args);
        this[testProp] = "OK"
        this._numOfConnectedCallbacksCalled = 0
        this._numODisconnectedCallbacksCalled = 1
    }

    connectedCallback(){
        this._numOfConnectedCallbacksCalled++ 
    }

    disconnectedCallback(){
        this._numOfConnectedCallbacksCalled++
    }
}

const ExtendedElementWithProp = directiveApi.fromAttribute("has").addDirectivesSupport(ElementWithProp)

const isConnected = Symbol("isConnected")
const disconnectedOnce = Symbol("disconnectedOnce")

ExtendedElementWithProp.defineDirective("test-directive", {
    connectedCallback(){
        const {ownerElement} = this
        ownerElement[isConnected] = true
        ownerElement[disconnectedOnce] = ownerElement[disconnectedOnce] === true
    },

    disconnectedCallback(){
        const {ownerElement} = this
        ownerElement[isConnected] = false
        ownerElement[disconnectedOnce] = true
    }
})
customElements.define("x-test", ExtendedElementWithProp)

test("extension test", t=> {    
    t.equals(ExtendedElementWithProp.name, ElementWithProp.name);
    const elem = document.createElement("x-test");
    elem.setAttribute("data-test", "2")
    elem.setAttribute("has", "test-directive")
    document.body.appendChild(elem)
    
    t.equals(elem.getAttribute("data-test"), "2");

    t.equals(elem[testProp], "OK");
    t.equals(elem[isConnected], true,  "isConnected property after insertion on DOM");
    t.equals(elem[disconnectedOnce], false,  "disconnectedOnce property after insertion on DOM");
    
    document.body.removeChild(elem)

    t.equals(elem[isConnected], false, "isConnected property after removal on DOM");
    t.equals(elem[disconnectedOnce], true, "disconnectedOnce property after removal on DOM");

    document.body.appendChild(elem)

    t.equals(elem[isConnected], true, "isConnected property after reinsert on DOM");
    t.equals(elem[disconnectedOnce], true, "disconnectedOnce property after reinsert on DOM");

    t.end()
})