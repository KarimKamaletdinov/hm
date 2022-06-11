import {init, addModel, clearModels, getElement} from "./three-renderer.js";

let is3D, eventYear, eventName, countryName, threeElement, simpleViewImg, simpleViewCanvas, context2d;

async function initGraphics(firstEvent) {
    if(is3D){
        simpleViewCanvas.setAttribute('hidden', '');
        init('./data/worlds/' + firstEvent.WorldId + '/base.3mf', () => {}, onNothingHovered);
        threeElement = getElement();
    } else {
        simpleViewCanvas.removeAttribute('hidden');
        simpleViewCanvas.width = simpleViewCanvas.clientWidth;
        simpleViewCanvas.height = simpleViewCanvas.clientHeight;
    }
    await loadCountries(firstEvent);
}

function yearToStr(year){
    if(year < 0)
        return -year + ' г. до н.э.'
    return year + ' г. н.э.'
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

export async function start(is3d, firstEvent, eventYearElement, eventNameElement, countryNameElement, simpleViewImgElement, simpleViewCanvasElement){
    is3D = is3d;
    eventYear = eventYearElement;
    eventName = eventNameElement;
    countryName = countryNameElement;
    simpleViewImg = simpleViewImgElement;
    simpleViewCanvas = simpleViewCanvasElement;
    context2d = simpleViewCanvasElement.getContext('2d');
    //simpleViewCanvas.addEventListener('mousemove', e => {
    //    const pixel = context2d.getImageData(e.x, e.y, 1, 1).data;
    //    const r =
    //})
    simpleViewImg.addEventListener('load', () => context2d.drawImage(simpleViewImg, 0, 0, simpleViewCanvas.clientWidth, simpleViewCanvas.clientHeight));

    await initGraphics(firstEvent);
}

export async function loadCountries(event){
    eventYear.textContent = yearToStr(event.Year);
    eventName.textContent = event.Name;
    if(is3D){
        const response = await fetch('./data/worlds/' + event.WorldId +'/countries.json');
        const countries = await response.json();
        clearModels();
        countries.Countries.forEach(country => {
            addModel('./data/worlds/' + event.WorldId + '/' + country + '.3mf', () => { }, e => { onHover(country, e)});
        });
    } else {
        simpleViewImg.src = './data/worlds/' + event.WorldId + '.bmp';
    }
}

export async function set3D(is3d, currentEvent){
    if(is3d !== is3D){
        is3D = is3d;
        if(is3D){
            simpleViewCanvas.setAttribute('hidden', '');
            if(threeElement === undefined){
                init('./data/worlds/' + currentEvent.WorldId + '/base.3mf', () => {}, () => {});
                threeElement = getElement();
            }
        } else {
            simpleViewCanvas.removeAttribute('hidden');
            simpleViewCanvas.width = simpleViewCanvas.clientWidth;
            simpleViewCanvas.height = simpleViewCanvas.clientHeight;
        }
        await loadCountries(currentEvent);
    }
}