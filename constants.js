const review_mode = "off"; // if "on", the number of trials will be reduced for reviewing the experiment
const save_data_locally = "on"; // if "on", the data will be saved locally after finishing the whole experiment
const jump_to_questionnaire = "off"; // if "on", it will jump to the questionnaire 

// Placeholder cue; imagery conditions can be assigned later.
const imageryPositions = ['middle / top / bottom'];
const primeNum = imageryPositions.length;
const testNum = 4;
const repeatTimes = 1;

const itiDuration = 500;
const fixationDuration = 500;
const linesDuration = 250;
const imageryDuration = 2000;
const incorrectDuration = 800;
const correctDuration = 900;
const feedback2Duration = 600;
const maxResponseTime = 2000;
const afterFixationInterval = 250;
const tooFastResponseTime = 200;

const imageDurationPractice = 1500;
const maxResponseTimePractice = 2000;
const imageryDurationPractice = 4000;

const currentURL = window.location.href;
const splitURL = currentURL.split("?")[1];
let debriefURL = "consent_and_debriefing/debriefing.html" + '?' + splitURL;

const keySame = 'S';
const keyDifferent = 'D';

const promptPlaceholder = "<br><span style='color: lightgray;'>placeholder</span>";
function svgDataUrl(svgMarkup) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
}

// All stimuli share the same canvas size (400) to keep their centers aligned.
const gridCellSize = 80;
const taskFrameSize = gridCellSize * 5;
const taskFrameBorderWidth = 6;
const taskFrameBorderColor = 'black';
document.documentElement.style.setProperty('--task-frame-size', `${taskFrameSize}px`);
document.documentElement.style.setProperty('--task-frame-border-width', `${taskFrameBorderWidth}px`);
document.documentElement.style.setProperty('--task-frame-border-color', taskFrameBorderColor);

function taskFrameOutline() {
    const inset = taskFrameBorderWidth / 2;
    const extent = taskFrameSize - taskFrameBorderWidth;
    return `<rect x="${inset}" y="${inset}" width="${extent}" height="${extent}" fill="none" stroke="${taskFrameBorderColor}" stroke-width="${taskFrameBorderWidth}"/>`;
}
const sameLineLength = 32;
const differentLineLength = 48;
const lineWidth = 3;

function gridStimulus(lineLengths = null) {
    const size = taskFrameSize;
    let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="lightgray"/>`;
    for (const column of [1, 3]) {
        markup += `<rect x="${column * gridCellSize}" y="${2 * gridCellSize}" width="${gridCellSize}" height="${gridCellSize}" fill="black"/>`;
    }
    for (let i = 1; i < 5; i++) {
        const coordinate = i * gridCellSize;
        markup += `<path d="M ${coordinate} 0 V ${size} M 0 ${coordinate} H ${size}" stroke="#999" stroke-width="1" stroke-dasharray="5 5"/>`;
    }
    if (lineLengths) {
        lineLengths.forEach((length, index) => {
            const x = (index === 0 ? 1.5 : 3.5) * gridCellSize;
            const y = size / 2;
            markup += `<line x1="${x}" y1="${y - length / 2}" x2="${x}" y2="${y + length / 2}" stroke="#ff0000" stroke-width="${lineWidth}"/>`;
        });
    }
    return svgDataUrl(markup + taskFrameOutline() + '</svg>');
}
