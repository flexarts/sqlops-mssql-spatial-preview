
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const infoDiv = document.querySelector('span');
const rootDiv = document.querySelector('body > div#root');
logInfo('TEST By JS');

function logInfo(txt: string) {
    if (infoDiv) {
        infoDiv.textContent = txt;
    }
}

function initBody() {
    if (rootDiv) {
        const map = new Map({
            target: rootDiv,
            layers: [
            new TileLayer({
                source: new XYZ({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                })
            })
            ],
            view: new View({
            center: [0, 0],
            zoom: 2
            })
        });
        console.log(map);
    } else {
        logInfo('Error loading openlayers')
    }
}


window.addEventListener('load', event => {
    initBody();
});

// Handle the message inside the webview
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case 'load':
            const { data, geocolumns } = message;
            logInfo(`Query returned ${data.length} rows (${geocolumns.length} spatial columns)`);
            document.title = `${data.length} Spatial Results`;
            break;
    }
});