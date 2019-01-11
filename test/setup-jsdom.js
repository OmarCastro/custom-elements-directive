import { JSDOM } from 'jsdom-wc'
const window = (new JSDOM()).window
global.window = window
global.document = window.document
global.customElements = window.customElements
require('mutationobserver-shim')
global.MutationObserver = window.MutationObserver
export default window
