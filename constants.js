const review_mode = "off"; // if "on", the number of trials will be reduced for reviewing the experiment
const save_data_locally = "on"; // if "on", the data will be saved locally after finishing the whole experiment
const jump_to_questionnaire = "off"; // if "on", it will jump to the questionnaire 

let primeNum;
let testNum;
if (review_mode == "on") {
    primeNum = 2;
    testNum = 1;
} else {
    primeNum = 1;
    testNum = 4;
}
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

function demoTextElement(text, x, y, size, color, anchor) {
    return '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-family="Arial, Helvetica, sans-serif" font-size="' + size + '" font-weight="700" text-anchor="' + anchor + '">' + text + '</text>';
}

function buildFixedPatternSvg({panelY = 40, panelHeight = 220, cells, label, labelY = 360, dashed = false}) {
    const cellSize = 52;
    const left = 90;
    const top = panelY + 20;
    const stroke = dashed ? 'stroke-dasharray="10 8"' : '';

    let blackSquares = '';
    cells.forEach(([cx, cy]) => {
        const x = left + (cx - 1) * cellSize;
        const y = top + (cy - 1) * cellSize;
        blackSquares += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="#111827"/>';
    });

    return svgDataUrl(
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">' +
        '<rect width="420" height="420" fill="#f2f2f2"/>' +
        '<rect x="20" y="' + panelY + '" width="380" height="' + panelHeight + '" fill="#d8d8d8" stroke="#1b3a5a" stroke-width="4" ' + stroke + '/>' +
        '<rect x="' + (left - 8) + '" y="' + (top - 8) + '" width="' + (cellSize * 3 + 16) + '" height="' + (cellSize * 3 + 16) + '" fill="none" stroke="#b0b0b0" stroke-width="2"/>' +
        '<rect x="' + (left + 52) + '" y="' + (top + 52) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 104) + '" y="' + (top + 52) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 156) + '" y="' + (top + 52) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 52) + '" y="' + (top + 104) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 104) + '" y="' + (top + 104) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 156) + '" y="' + (top + 104) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 52) + '" y="' + (top + 156) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 104) + '" y="' + (top + 156) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        '<rect x="' + (left + 156) + '" y="' + (top + 156) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#d8d8d8"/>' +
        blackSquares +
        (label ? '<text x="210" y="' + labelY + '" fill="#1f2937" font-family="Arial, Helvetica, sans-serif" font-size="20" text-anchor="middle">' + label + '</text>' : '') +
        '</svg>'
    );
}

function demoPrimeStimulus() {
    return buildFixedPatternSvg({
        panelY: 50,
        panelHeight: 250,
        label: 'Imagine middle / top / bottom',
        labelY: 365,
        cells: [[2, 1], [1, 2], [3, 2], [2, 3]]
    });
}

function demoImageryStimulus() {
    return buildFixedPatternSvg({
        panelY: 40,
        panelHeight: 260,
        label: 'Imagine the pattern here',
        labelY: 360,
        cells: [[2, 1], [1, 2], [3, 2], [2, 3]],
        dashed: true
    });
}

function demoTestStimulus(isSame, variant) {
    const sameCells = [[2, 1], [1, 2], [3, 2], [2, 3]];
    const differentCells = [[2, 1], [1, 2], [3, 3], [2, 3]];
    const cells = isSame ? sameCells : differentCells;
    return buildFixedPatternSvg({
        panelY: 40,
        panelHeight: 260,
        label: 'Same / Different',
        labelY: 360,
        cells: cells
    });
}

const fixationImage = svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">' +
    '<rect width="420" height="420" fill="#ffffff"/>' +
    '<text x="210" y="238" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" text-anchor="middle">+</text>' +
    '</svg>'
);
const boxImage = demoImageryStimulus();
const promptImagery = "<br>Imagine them in place";
const promptImagery2 = "<br>Imagine the combined pattern";
const promptImage = "<br>Focus on the shapes";

const incorrectFeedback = '<div style="color: red; font-size: 20pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">Incorrect.</div>'
const tooSlowFeedback = '<div style="color: red; font-size: 16pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">Too slow! <br> Press the spacebar to continue.</div>';
const tooFastFeedback = '<div style="color: red; font-size: 16pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center;box-sizing: border-box;">Do not press before the test shapes appear. <br> Press the spacebar to continue.</div>';
const HowVivid = '<div style="color: black; font-size: 16pt; border: 8px solid black; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center;box-sizing: border-box;">How vivid?</div>';

let illustrationImage = [];
let illustrationGif = [];
