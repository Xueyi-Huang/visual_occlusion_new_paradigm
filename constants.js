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

const itiDuration = 1000;
const fixationDuration = 250;
const imageDuration = 1000;
const imageryDuration = 2000;
const gap3Duration = 100;
const incorrectDuration = 1000;
const correctDuration = 1250;
const feedback2Duration = 1000;
const maxResponseTime = 1500;
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

function demoPrimeStimulus() {
    return svgDataUrl(
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">' +
        '<rect width="420" height="420" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>' +
        demoTextElement('Imagine these shapes', 210, 42, 20, '#374151', 'middle') +
        demoTextElement('●', 148, 238, 88, '#111827', 'middle') +
        demoTextElement('■', 272, 238, 88, '#111827', 'middle') +
        '</svg>'
    );
}

function demoImageryStimulus() {
    return svgDataUrl(
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">' +
        '<rect width="420" height="420" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="10 8"/>' +
        demoTextElement('Imagine the shapes here', 210, 220, 20, '#94a3b8', 'middle') +
        '</svg>'
    );
}

function demoTestStimulus(isSame, variant) {
    const sameTrials = [
        {left: '●', right: '●', corner: '△', cornerTop: 28, cornerLeft: 20},
        {left: '■', right: '■', corner: '●', cornerTop: 28, cornerLeft: 332},
    ];
    const differentTrials = [
        {left: '●', right: '■', corner: '△', cornerTop: 332, cornerLeft: 20},
        {left: '▲', right: '●', corner: '■', cornerTop: 332, cornerLeft: 332},
    ];
    const choice = isSame ? sameTrials[variant % sameTrials.length] : differentTrials[variant % differentTrials.length];
    return svgDataUrl(
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">' +
        '<rect width="420" height="420" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>' +
        demoTextElement(choice.corner, choice.cornerLeft + 24, choice.cornerTop + 40, 50, '#9ca3af', 'middle') +
        demoTextElement(choice.left, 148, 238, 86, '#111827', 'middle') +
        demoTextElement(choice.right, 272, 238, 86, '#111827', 'middle') +
        '</svg>'
    );
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
