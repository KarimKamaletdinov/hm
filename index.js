import {init, setUrl} from "./renderer.js";

let i = 0;
const response = await fetch('./data/events.json');
const events = await response.json();
init('./data/worlds/' + events[0].WorldId + '.3mf', () => {
    document.querySelector('#event-year').textContent = yearToStr(events[0].Year);
    document.querySelector('#event-name').textContent = events[0].Name;
});
i++;
loadNext().then();

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function yearToStr(year){
    if(year < 0)
        return -year + ' г. до н.э.'
    return year + ' г. н.э.'
}

async function loadNext() {
    await sleep(10000);
    const event = events[i];
    setUrl('./data/worlds/' + event.WorldId + '.3mf', () => {
        document.querySelector('#event-year').textContent = yearToStr(event.Year);
        document.querySelector('#event-name').textContent = event.Name;
    });
    i+=1;
    if(i < events.length)
        await loadNext();
}