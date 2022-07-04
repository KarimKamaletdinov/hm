import {start, loadCountries, set3D} from "./manager.js";
import { init, addEvent, removeEvent } from "./event-list.js";

const response = await fetch('./data/events.json');
const events = await response.json();

const eventYear = document.querySelector('#event-year');
const ourAge = document.querySelector('#our-age');
const beforeOurAge = document.querySelector('#before-our-age');
const eventName = document.querySelector('#event-name');
const eventPanel = document.querySelector('#event-panel');
const countryName = document.querySelector('#country-name');
const switcher = document.querySelector('#switch');
const aboutLink = document.querySelector('#about-link');
const simpleView = document.querySelector('#simple-view');
const simpleViewCanvas = document.querySelector('#simple-view-canvas');
const bottomInfo = document.querySelector('#bottom-info');
const closeBottomInfo = document.querySelector('#bottom-info-close');

let is3D = true;

if(localStorage['is3D'] !== undefined){
    is3D = localStorage['is3D'] === 'true';
}

switcher.addEventListener('click', switchView);

if(localStorage['infoClosed'] === 'true'){
    bottomInfo.remove();
} else {
    closeBottomInfo.addEventListener('click', _ => {
        localStorage['infoClosed'] = true;
        bottomInfo.remove();
    });
}

initGui().then();

let continuousEvents = [];

const startNum = 0;
let id = startNum + 1;

start(is3D, events[startNum], eventYear, eventName, countryName, simpleView, simpleViewCanvas).then(() => {
    let year = events[startNum].Year;
    eventYear.textContent = year < 0 ? -year : year;
    if(year < 0){
        beforeOurAge.removeAttribute('hidden');
        ourAge.setAttribute('hidden', '');
    } else {
        ourAge.removeAttribute('hidden');
        beforeOurAge.setAttribute('hidden', '');
    }
    init(eventPanel, eventName);
    load(startNum).then(() => {
        if(events.length > 1){
            let next = events[startNum + 1].Year;
            let interval = setInterval(nextYear, 5);

            function nextYear() {
                if (year < next) {
                    year++;
                    if (year === 0) {
                        ourAge.removeAttribute('hidden');
                        beforeOurAge.setAttribute('hidden', '');
                    }
                    eventYear.textContent = year < 0 ? -year : year;
                    if(continuousEvents.some(x => x.EndYear == year)){
                        continuousEvents.filter(x => x.EndYear == year).forEach(ce => removeEvent(ce.Name));
                        continuousEvents = continuousEvents.filter(x => x.EndYear != year);
                    }
                } else {
                    clearInterval(interval);
                    load(id).then(() => {
                        if (id + 1 < events.length) {
                            id += 1;
                            next = events[id].Year;
                            interval = setInterval(nextYear, 7);
                        }
                    });
                }
            }
        }
    });
});



function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function load(id) {
    const event = events[id];
    addEvent(event.Name);
    await loadCountries(event);
    await sleep(2000);
    if (event.EndYear == null){
        removeEvent(event.Name);
    } else {
        continuousEvents.push(event);
    }
}

async function initGui(){
    if(is3D){
        eventYear.className = 'event-year';
        eventName.className = 'event-name';
        switcher.className = 'btn';
        aboutLink.className = 'btn';
        switcher.textContent = '2D';
        beforeOurAge.className = 'event-year';
        ourAge.className = 'event-year';
    } else {
        eventYear.className = 'event-year-dark';
        eventName.className = 'event-name-dark';
        switcher.className = 'btn-dark';
        aboutLink.className = 'btn-dark';
        switcher.textContent = '3D';
        beforeOurAge.className = 'event-year-dark';
        ourAge.className = 'event-year-dark';
    }
}

async function switchView(_) {
    is3D = !is3D;
    await initGui();
    await set3D(is3D, events[id]);
    localStorage['is3D'] = is3D;
}