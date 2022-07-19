let parentComponent, baseComponent;
let elements = [];

export function init(parent, base){
    parentComponent = parent;
    baseComponent = base;
}

export function addEvent(text){
    let newComponent = baseComponent.cloneNode(true);
    newComponent.textContent = text;
    elements.push(newComponent);
    parentComponent.appendChild(newComponent);
}

export function removeEvent(text){
    let children = Array.prototype.slice.call(parentComponent.children);
    children.forEach(element => {
        if(element.textContent === text){
            element.remove();
            elements = elements.filter(x => x != element);
        }
    });
}

export function clearAllEvents(){
    elements.forEach(element => {
        element.remove();
    });
}