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
const imageDuration = 250;
const imageryDuration = 2000;
const gap3Duration = 250;
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
const promptKey = "<br>S = Same, D = Different";

const promptVivdness = "<br>1 (Not vivid at all) - 5 (Perfectly vivid)";
const promptPlaceholder = "<br><span style='color: lightgray;'>placeholder</span>";
function svgDataUrl(svgMarkup) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
}

// All stimuli share a 330 px canvas to keep their centers aligned.
const gridCellSize = 66;
const sameLineLength = 32;
const differentLineLength = 48;
const lineWidth = 3;

function gridStimulus(lineLengths = null) {
    const size = gridCellSize * 5;
    let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#bfbfbf"/>`;
    for (const column of [1, 3]) {
        markup += `<rect x="${column * gridCellSize}" y="${2 * gridCellSize}" width="${gridCellSize}" height="${gridCellSize}" fill="black"/>`;
    }
    for (let i = 0; i <= 5; i++) {
        const coordinate = i * gridCellSize;
        markup += `<path d="M ${coordinate} 0 V ${size} M 0 ${coordinate} H ${size}" stroke="#222" stroke-width="2"/>`;
    }
    if (lineLengths) {
        lineLengths.forEach((length, index) => {
            const x = (index === 0 ? 1.5 : 3.5) * gridCellSize;
            const y = size / 2;
            markup += `<line x1="${x}" y1="${y - length / 2}" x2="${x}" y2="${y + length / 2}" stroke="#ff0000" stroke-width="${lineWidth}"/>`;
        });
    }
    return svgDataUrl(markup + '</svg>');
}

const fixationImage = svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="330" height="330"><rect x="2" y="2" width="326" height="326" fill="#d3d3d3" stroke="#10283f" stroke-width="4"/><text x="165" y="165" dominant-baseline="central" text-anchor="middle" font-family="Arial" font-size="32">+</text></svg>');
const HowVivid = '<div class="task-panel">How vivid?</div>';
