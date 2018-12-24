import parseAttributeValue from "./parser"

const appliedDirectivesProp = Symbol("appliedDirectivesProp")

function connectDirectives(element, definedDirectives){
    const attributeWithDirectives = element.getAttribute(targetAttributeName)
    const parsedAttributeMap = attributeWithDirectives ? parseAttributeValue(attributeWithDirectives) : {}
    const appliedDirectives = [];
    element[appliedDirectivesProp] = appliedDirectives

    for(const [key, value] of Object.entries(parsedAttributeMap)){
        if(definedDirectives[key]){
            const directiveInstance = Object.create(definedDirectives[key]);
            directiveInstance.ownerElement = element;
            directiveInstance.directive = {name: key, value} 
            appliedDirectives.push(directiveInstance)
        }
    }
    for(const directiveInstance of element[appliedDirectivesProp]){
        if(typeof directiveInstance.connectedCallback === "function"){
            directiveInstance.connectedCallback();
        }
    }
}

function disconnectDirectives(element){
    const appliedDirectives = element[appliedDirectivesProp] || [];
    for (let i = appliedDirectives.length - 1; i >=0 ; i--) {
        const directiveInstance = appliedDirectives[i];
        if(typeof directiveInstance.disconnectedCallback === "function"){
            directiveInstance.disconnectedCallback();
        }
    }
    element[appliedDirectivesProp] = [];
}


function addDirectivesSupport(targetElementClass, targetAttributeName){    
    class WithDirectivesSupport extends targetElementClass {
        
        static get definedDirectives(){
            return Object.assign({}, WithDirectivesSupport._definedDirectives);
        }

        static defineDirective(directiveName, directivePrototype){
            if(typeof directiveName !== "string"){
                throw Error("expected directive name to be a string")
            }
            return WithDirectivesSupport._definedDirectives[directiveName] = directivePrototype
        }

        disconnectedCallback(){
            disconnectDirectives(this)
            if(typeof super.disconnectedCallback === "function"){
                super.disconnectedCallback()
            }
        }

        connectedCallback(){
            if(typeof super.connectedCallback === "function"){
                super.connectedCallback()
            }
            connectDirectives(this, WithDirectivesSupport._definedDirectives)
            if(typeof super.directivesConnectedCallback === "function"){
                super.directivesConnectedCallback()
            }
        }
    }

    WithDirectivesSupport._definedDirectives = {}

    return WithDirectivesSupport
}

const API = {
    fromAttribute(attribute){
        return {
            addDirectivesSupport(targetClass){
                return addDirectivesSupportMixin(targetClass, attribute);
            }
        }
    }
};

export default API;