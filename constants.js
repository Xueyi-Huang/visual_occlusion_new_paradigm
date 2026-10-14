const review_mode = "off"; // if "on", the number of trials will be reduced for reviewing the experiment
const save_data_locally = "off"; // if "on", the data will be saved locally after finishing the whole experiment
const jump_to_questionnaire = "off"; // if "on", it will jump to the questionnaire 

let primeNum;
let testNum;
if (review_mode == "on") {
    primeNum = 2;
    testNum = 1;
} else {
    primeNum = 8;
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
const boxImage = 'image/box/box.svg';
const promptImagery = "<br>Imagine them in place";
const promptImagery2 = "<br>Imagine the combined pattern";
const promptImage = "<br>Focus on the shapes";

const incorrectFeedback = '<div style="color: red; font-size: 20pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">Incorrect.</div>'
const tooSlowFeedback = '<div style="color: red; font-size: 16pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">Too slow! <br> Press the spacebar to continue.</div>';
const tooFastFeedback = '<div style="color: red; font-size: 16pt; border: 8px solid red; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center;box-sizing: border-box;">Do not press before the test shapes appear. <br> Press the spacebar to continue.</div>';
const HowVivid = '<div style="color: black; font-size: 16pt; border: 8px solid black; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center;box-sizing: border-box;">How vivid?</div>';

let testImages = [];
let noPrimeImages = [];
let primeSepImages = [];
let primeOccImages = [];
let primeCompleteImages = [];
let bigAnchorImage = [];
let smallAnchorImage = [];
for (let i = 1; i <= 8; i++) {
    let myNoPrimeImage = 'image/' + i + '/no_prime_triangle_frame' + '.svg';
    let myPrimeSepImages = 'image/' + i + '/prime_sep_frame' + '.svg';
    let myPrimeOccImages = 'image/' + i + '/prime_occ_frame' + '.svg';
    let myPrimeCompleteImages = 'image/' + i + '/prime_complete_frame' + '.svg';
    let myBigAnchorImage = 'image/' + i + '/anchor_big' + '.svg';
    let mySmallAnchorImage = 'image/' + i + '/anchor_small' + '.svg';
    noPrimeImages.push(myNoPrimeImage);
    primeSepImages.push(myPrimeSepImages);
    primeOccImages.push(myPrimeOccImages);
    primeCompleteImages.push(myPrimeCompleteImages);
    bigAnchorImage.push(myBigAnchorImage);
    smallAnchorImage.push(mySmallAnchorImage);
    for (let j = 1; j <= 4; j++) {
        let myTestImage = 'image/' + i + '/test' + j + '.svg';
        testImages.push(myTestImage);
    }
}

const fixationImage = 'image/fixation/fixation.svg';
const illustrationImage = ['image/illustration/illustration1.svg', 'image/illustration/illustration2.svg', 'image/illustration/illustration3.svg', 'image/illustration/illustration4.svg', 'image/illustration/illustration5.svg', 'image/illustration/illustration6.svg', 'image/illustration/illustration7.svg', 'image/illustration/illustration8.svg', 'image/illustration/illustration9.svg', 'image/illustration/illustration10.png', 'image/illustration/illustration11.svg', 'image/illustration/illustration12.png', 'image/illustration/illustration13.png', 'image/illustration/illustration14.png', 'image/illustration/illustration15.png', 'image/illustration/illustration16.png', 'image/illustration/illustration17.png'];
const illustrationGif =['image/illustration/gif1.gif', 'image/illustration/gif2.gif'];