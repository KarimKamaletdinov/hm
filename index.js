import {init, addModel, clearModels} from "./renderer.js";

const response = await fetch('./data/events.json');
const events = await response.json();
init('./data/worlds/' + events[0].WorldId + '/base.3mf', () => {
    document.querySelector('#event-year').textContent = yearToStr(events[0].Year);
    document.querySelector('#event-name').textContent = events[0].Name;
});

loadNext().then();

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function yearToStr(year){
    if(year < 0)
        return -year + ' г. до н.э.'
    return year + ' г. н.э.'
}

let i = 0;
async function loadNext() {
    await sleep(10000);
    const event = events[i];
    const r = await fetch('./data/worlds/' + event.WorldId +'/countries.json');
    const countries = await r.json();
    let textPrinted = false;
    clearModels();
    countries.Countries.forEach(c => {
        addModel('./data/worlds/' + event.WorldId + '/' + c + '.3mf', c, () => {
            if(!textPrinted){
                document.querySelector('#event-year').textContent = yearToStr(event.Year);
                document.querySelector('#event-name').textContent = event.Name;
                textPrinted = true;
            }
        });
    })
    i+=1;
    if(i < events.length)
        await loadNext();
}