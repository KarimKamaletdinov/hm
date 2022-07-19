import {start, loadCountries, set3D, jumpTo} from "./manager.js";
import { init, addEvent, removeEvent, clearAllEvents } from "./event-list.js";

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

const yearDialog = document.querySelector('#input-year-dialog');
const inputYear = document.querySelector('#input-year');
const yearDialogOk = document.querySelector('#input-year-dialog-ok');
const yearDialogCancel = document.querySelector('#input-year-dialog-cancel');
const showYearDialog = document.querySelector('#show-input-year-dialog');

const pause = document.querySelector('#pause');

const speedDialog = document.querySelector('#speed-dialog');
const speedDialogPlus = document.querySelector('#speed-dialog-plus');
const speedDialogMinus = document.querySelector('#speed-dialog-minus');
const speedDialogValue = document.querySelector('#speed-dialog-value');
const speedDialogOk = document.querySelector('#speed-dialog-ok');
const speedDialogCancel = document.querySelector('#speed-dialog-cancel');
const showSpeedDialog = document.querySelector('#show-speed-dialog');

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

pause.addEventListener('click', pauseClicked);

showYearDialog.addEventListener('click', () => {yearDialog.removeAttribute('hidden'); paused = true;});
yearDialogOk.addEventListener('click', handleYearDialogSubmit);
yearDialogCancel.addEventListener('click', () => {yearDialog.setAttribute('hidden', ''); paused = false;});

showSpeedDialog.addEventListener('click', () => {speedDialog.removeAttribute('hidden'); paused = true;});
speedDialogPlus.addEventListener('click', handleSpeedDialogPlus);
speedDialogMinus.addEventListener('click', handleSpeedDialogMinus);
speedDialogOk.addEventListener('click', handleSpeedDialogSubmit);
speedDialogCancel.addEventListener('click', () => {speedDialog.setAttribute('hidden', ''); paused = false;});

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

const speedMin = 0;
const speedMax = 10;

let speed, timeout;
const startNum = 0;
let id = startNum + 1;
let year, next;
let paused = false;

const maxYear = events[events.length - 1].Year;

async function run(){
    speed = await getSpeed();
    speedDialogValue.textContent = speed;
    timeout = 31 - 3 * speed;

    await start(is3D, events[startNum], eventYear, eventName, countryName, simpleView, simpleViewCanvas);
    year = events[startNum].Year;
    eventYear.textContent = year < 0 ? -year : year;
    if(year < 0){
        beforeOurAge.removeAttribute('hidden');
        ourAge.setAttribute('hidden', '');
    } else {
        ourAge.removeAttribute('hidden');
        beforeOurAge.setAttribute('hidden', '');
    }
    init(eventPanel, eventName);
    await load(startNum);
    next = events[startNum + 1].Year;

    while(true){
        if(year <= maxYear && !paused){
            await nextYear();
            await sleep(timeout);
        } else {
            await sleep(100);
        }
    }
}

run();

async function nextYear() {
    if (year < next) {
        year++;
        if (year === 0) {
            ourAge.removeAttribute('hidden');
            beforeOurAge.setAttribute('hidden', '');
        }
        eventYear.textContent = year < 0 ? -year : year;
        if(continuousEvents.some(x => x.EndYear == year)){
            continuousEvents.filter(x => x.EndYear == year).forEach(ce => removeEvent(stringifyContinuousEvent(ce)));
            continuousEvents = continuousEvents.filter(x => x.EndYear != year);
        }
    } else {
        await load(id).then(() => {
            if (id + 1 < events.length) {
                id += 1;
                next = events[id].Year;
            }
        });
    }
}



function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function stringifyYear(year){
    if(year < 0){
        return (-year).toString() + ' до н.э.'
    } else {
        return year.toString();
    }
}

function stringifyContinuousEvent(ce){
    return `${ce.Name} (${stringifyYear(ce.Year)} - ${stringifyYear(ce.EndYear)})`;
}

async function load(id) {
    const event = events[id];
    if(event.EndYear == null){
        addEvent(event.Name);
    } else {
        addEvent(stringifyContinuousEvent(event));
    }
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
        showYearDialog.className = 'btn';
        showSpeedDialog.className = 'btn';
        pause.className = 'btn';
        switcher.textContent = '2D';
        beforeOurAge.className = 'event-year';
        ourAge.className = 'event-year';
        document.querySelectorAll('.event-name-dark').forEach(e => e.className = 'event-name');
    } else {
        eventYear.className = 'event-year-dark';
        eventName.className = 'event-name-dark';
        switcher.className = 'btn-dark';
        aboutLink.className = 'btn-dark';
        showYearDialog.className = 'btn-dark';
        showSpeedDialog.className = 'btn-dark';
        pause.className = 'btn-dark';
        switcher.textContent = '3D';
        beforeOurAge.className = 'event-year-dark';
        ourAge.className = 'event-year-dark';
        document.querySelectorAll('.event-name').forEach(e => e.className = 'event-name-dark');
    }
}

async function switchView(_) {
    paused = true;
    is3D = !is3D;
    await initGui();
    await set3D(is3D, events[id]);
    localStorage['is3D'] = is3D;
    paused = false;
}

async function handleYearDialogSubmit(){
    if(isNaN(inputYear.value) || inputYear.value == ''){
        inputYear.value = 0;
    } else {
        const year = parseInt(inputYear.value);
        yearDialog.setAttribute('hidden', '');
        jump(year);
    }
}

async function jump(y){
    paused = true;
    clearAllEvents();
    let currentEvent;
    events.forEach(async (event) => {
        if(event.Year < y){
            currentEvent = event;
            if(event.EndYear != null && event.EndYear >= y){
                continuousEvents.push(event);
                addEvent(stringifyContinuousEvent(event));
            }
        }
    });
    await jumpTo(currentEvent);
    if(currentEvent !== undefined){
        let index = events.indexOf(currentEvent);
        id = index + 1;
        if(index + 1 < events.length){
            next = events[index + 1].Year;
        } else {
            next = currentEvent.Year;
        }
    } else {
        next = events[0].Year;
        id = 0;
    }
    year = y - 1;
    eventYear.textContent = y < 0 ? -y : y;
    if(y < 0){
        beforeOurAge.removeAttribute('hidden');
        ourAge.setAttribute('hidden', '');
    } else {
        ourAge.removeAttribute('hidden');
        beforeOurAge.setAttribute('hidden', '');
    }
    paused = false;
}

async function pauseClicked(){
    if(paused){
        pause.textContent = '►';
        paused = false;
    } else {
        pause.textContent = '=';
        paused = true;
    }
}

async function handleSpeedDialogPlus(){
    const val = parseInt(speedDialogValue.textContent);
    if(val < speedMax){
        speedDialogValue.textContent = val + 1;
    }
}

async function handleSpeedDialogMinus(){
    const val = parseInt(speedDialogValue.textContent);
    if(val > speedMin + 1){
        speedDialogValue.textContent = val - 1;
    }
}

async function handleSpeedDialogSubmit(){
    const val = parseInt(speedDialogValue.textContent);
    await setSpeed(val);
    paused = false;
    speedDialog.setAttribute('hidden', '');
}

async function getSpeed(){
    const value = localStorage.getItem('speed');
    if(value == null){
        return 3;
    }
    return parseInt(value);
}

async function setSpeed(value){
    if(value > speedMin && value <= speedMax){
        speed = value;
        timeout = 31 - 3 * speed;
        localStorage.setItem('speed', value);
    }
}