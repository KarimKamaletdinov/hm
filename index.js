import {start, loadCountries, set3D} from "./manager.js";

const response = await fetch('./data/events.json');
const events = await response.json();

const eventYear = document.querySelector('#event-year');
const eventName = document.querySelector('#event-name');
const countryName = document.querySelector('#country-name');
const switcher = document.querySelector('#switch');
const simpleView = document.querySelector('#simple-view');
const simpleViewCanvas = document.querySelector('#simple-view-canvas');

let is3D = true;

if(localStorage['is3D'] !== undefined){
    is3D = localStorage['is3D'] === 'true';
}

const isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);

if(isMobile){
    is3D = false;
    if(screen.orientation.type !== "landscape-primary" && screen.orientation.type !== "landscape-secondary")
        alert("Поверните экран");
    switcher.setAttribute('hidden', '');
}

switcher.addEventListener('click', switchView);

initGui().then();
start(is3D, events[0], eventYear, eventName, countryName, simpleView, simpleViewCanvas).then();


loadNext().then();

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

let i = 1;
async function loadNext() {
    await sleep(10000);
    await loadCountries(events[i]);
    if(i + 1 < events.length){
        i+=1;
        await loadNext();
    }
}

async function initGui(){
    if(is3D){
        eventYear.className = 'event-year';
        eventName.className = 'event-name';
        switcher.className = 'switch';
        switcher.textContent = '2D';
    } else {
        eventYear.className = 'event-year-dark';
        eventName.className = 'event-name-dark';
        switcher.className = 'switch-dark';
        switcher.textContent = '3D';
    }
}

async function switchView(_) {
    is3D = !is3D;
    await initGui();
    await set3D(is3D, events[i]);
    localStorage['is3D'] = is3D;
}