
export async function getResorts() {
    fetch('./resortdata.json')
        .then((res) => { return res.json() });
}

export function getStates(resortData) {
    let states = new Array();
    for (let resort of resortData) {
        states.push(resort.state);
    }
    return states;
}

export function filterByState(trips, state) {
    let resorts = new Array();
    for (let resort of resortData) {
        if (resort.state.tolower() == state.tolower())
            resorts.push(resort);
    }
    return resorts;
}

export function generateSearchHtml(resorts) {
    let html = new String();
    for (let resort of resorts) {
        html.append("<div>" + resort.name + "</div>");
    }
    return html;
}

function filterByDistance(trips, location) {
    return;
}
