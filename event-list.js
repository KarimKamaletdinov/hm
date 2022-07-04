let parentComponent, baseComponent;

export function init(parent, base){
    parentComponent = parent;
    baseComponent = base;
}

export function addEvent(text){
    let newComponent = baseComponent.cloneNode(true);
    newComponent.textContent = text;
    parentComponent.appendChild(newComponent);
}

export function removeEvent(text){
    let children = Array.prototype.slice.call(parentComponent.children);
    children.forEach(element => {
        if(element.textContent === text){
            element.remove();
        }
    });
}