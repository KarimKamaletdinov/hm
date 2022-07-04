import {init, addModel, updateModel, removeModel, getElement, hasModel, clearModels, render} from "./three-renderer.js";

let is3D, eventYear, eventName, countryName, threeElement, simpleViewImg, simpleViewCanvas, context2d, currentEvent;

function initGraphics(firstEvent) {
    return new Promise((resolve) => {
        if(is3D){
            simpleViewCanvas.setAttribute('hidden', '');
            init('./data/worlds/' + firstEvent.WorldId + '/base.3mf', () => {
                resolve();
            }, onNothingHovered);
            threeElement = getElement();
        } else {
            simpleViewCanvas.removeAttribute('hidden');
            simpleViewCanvas.width = simpleViewCanvas.clientWidth;
            simpleViewCanvas.height = simpleViewCanvas.clientHeight;
            resolve();
        }
    });
}

function onHover(country, event) {
    if(countryName.hasAttribute('hidden')){
        countryName.removeAttribute('hidden');
    }
    countryName.style.left = (event.clientX - 50) + 'px';
    countryName.style.top = (event.clientY + 10) + 'px';
    countryName.textContent = country;
}

function onNothingHovered() {
    countryName.setAttribute('hidden', '');
}

async function onMouseMove2D(e) {
    const pixel = context2d.getImageData(e.x, e.y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const response = await fetch('./data/worlds/' + currentEvent.WorldId +'/countries.json');
    const countries = await response.json();
    if(countries.Countries.some(x => x.Color.R === r && x.Color.G === g && x.Color.B === b)){
        let country = countries.Countries.find(x => x.Color.R === r && x.Color.G === g && x.Color.B === b);
        onHover(country.Name, e);
    } else {
        onNothingHovered();
    }
}

export async function start(is3d, firstEvent, eventYearElement, eventNameElement, countryNameElement, simpleViewImgElement, simpleViewCanvasElement){
    is3D = is3d;
    eventYear = eventYearElement;
    eventName = eventNameElement;
    countryName = countryNameElement;
    simpleViewImg = simpleViewImgElement;
    simpleViewCanvas = simpleViewCanvasElement;
    context2d = simpleViewCanvasElement.getContext('2d');
    simpleViewCanvas.addEventListener('mousemove', e => {
        if(!is3D)
            onMouseMove2D(e);
    });
    simpleViewCanvas.addEventListener('click', e => {
        if(!is3D)
            onMouseMove2D(e);
    });
    simpleViewImg.addEventListener('load', () => {
        context2d.clearRect(0, 0, simpleViewCanvas.clientWidth, simpleViewCanvas.clientHeight);
        context2d.drawImage(simpleViewImg, 0, 0, simpleViewCanvas.clientWidth, simpleViewCanvas.clientHeight);
    });

    await initGraphics(firstEvent);
}

export async function loadCountries(event){
    currentEvent = event;
    if(is3D){
        if(event.ChangedCountriesNames.length === 0)
            return;
        const response = await fetch('./data/worlds/' + event.WorldId + '.json');
        const countries = await response.json();
        let add = [];
        let update = [];
        let remove = [];
        event.ChangedCountriesNames.forEach(async (country) => {
            if(countries.some(c => c.Name == country)){
                if(hasModel(country)){
                    update.push(country);
                } else {
                    add.push(country);
                }
            } else if (hasModel(country)){
                remove.push(country);
            }
        });
        add.forEach(async (country) =>{
            await addModel('./data/worlds/' + event.WorldId + '/' + country + '.3mf', country, e => onHover(country, e));
        });
        update.forEach(async (country) =>{
            await updateModel(country, './data/worlds/' + event.WorldId + '/' + country + '.3mf');
        });
        remove.forEach((country) =>{
            removeModel(country);
        });
    } else {
        simpleViewImg.src = './data/worlds/' + event.WorldId + '.bmp';
    }
}


function loadAllCountries(event){
    return new Promise(r => {
        currentEvent = event;
        if(is3D){
            fetch('./data/worlds/' + event.WorldId + '.json').then(response => response.json().then(countries => {
                clearModels();
                countries.forEach(country => {
                    if(country.Name != 'water'){
                        addModel('./data/worlds/' + event.WorldId + '/' + country.Name + '.3mf', country.Name,
                        r, e => { onHover(country.Name, e)});
                    }
                });
            }));
        } else {
            simpleViewImg.src = './data/worlds/' + event.WorldId + '.bmp';
            r();
        }
    });
}

export async function set3D(is3d){
    if(is3d !== is3D){
        is3D = is3d;
        if(is3D){
            simpleViewCanvas.setAttribute('hidden', '');
            if(threeElement === undefined){
                init('./data/worlds/' + currentEvent.WorldId + '/base.3mf', () => {
                    loadAllCountries(currentEvent);
                }, onNothingHovered);
                threeElement = getElement();
            } else {
                loadAllCountries(currentEvent);
            }
        } else {
            simpleViewCanvas.removeAttribute('hidden');
            simpleViewCanvas.width = simpleViewCanvas.clientWidth;
            simpleViewCanvas.height = simpleViewCanvas.clientHeight;
            await loadAllCountries(currentEvent);
        }
    }
}