const review_mode = "on"; // if "on", the number of trials will be reduced for reviewing the experiment
const save_data_locally = "on"; // if "on", the data will be saved locally after finishing the whole experiment
const jump_to_questionnaire = "off"; // if "on", it will jump to the questionnaire
const skip_vviq = "off"; // Set to "on" to skip the VVIQ.

// Imagery condition IDs; independent of randomized block order.
const conditionPositions = {1: 'middle', 2: 'top', 3: 'behind'};

const repeatTimes = 16; // Four line pairs × 16 repetitions = 64 trials per block, 192 total.

const itiDuration = 500;
const fixationDuration = 500;
const linesDuration = 250;
const imageryDuration = 4000;
const feedbackDuration = 1000;
const maxResponseTime = 2000;
const minResponseTime = 200;

const linesDurationPractice = 750; // Longer line viewing in practice round 1.
const imageryDurationPractice = 5000;

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
const shortLine = 32;
const longLine = 48;
const linePairs = [
    [shortLine, shortLine],
    [longLine, longLine],
    [shortLine, longLine],
    [longLine, shortLine],
];
const lineWidth = 3;

function gridStimulus(lineLengths = null) {
    const size = taskFrameSize;
    let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="lightgray"/>`;
    for (const column of [1, 3]) {
        markup += `<rect x="${column * gridCellSize}" y="${2 * gridCellSize}" width="${gridCellSize}" height="${gridCellSize}" fill="${squareColor}"/>`;
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


// VVIQ items and scoring, matching the supplied questionnaire.
const vviqItems = [
    "Think of some relative or friend whom you frequently see (but who is not with you at present) and consider carefully the picture that comes before your mind's eye.",
    "Think of the rising sun. Consider carefully the picture that comes before your mind's eye.",
    "Think of the front of a shop which you often go to. Consider the picture that comes before your mind's eye.",
    "Finally, think of a country scene which involves trees, mountains and a lake. Consider the picture that comes before your mind's eye.",
];

const vviqQuestions1 = [
    "1 The exact contour of face, head, shoulders and body.",
    "2 Characteristic poses of head, attitudes of body etc.",
    "3 The precise carriage, length of step, etc. in walking.",
    "4 The different colors worn in some familiar clothes."
];
const vviqQuestions2 = [
    "5 The sun is rising above the horizon into a hazy sky.",
    "6 The sky clears and surrounds the sun with blueness.",
    "7 Clouds. A storm blows up, with flashes of lightening.",
    "8 A rainbow appears."
];
const vviqQuestions3 = [
    "9 The overall appearance of the shop from the opposite side of the road.",
    "10 A window display including colors, shape and details of individual items for sale.",
    "11 You are near the entrance. The color, shape and details of the door.",
    "12 You enter the shop and go to the counter. The counter assistant serves you. Money changes hands."
];
const vviqQuestions4 = [
    "13 The contours of the landscape.",
    "14 The color and shape of the trees.",
    "15 The color and shape of the lake.",
    "16 A strong wind blows on the tree and on the lake causing waves."
];

const vviqQuestions = [vviqQuestions1, vviqQuestions2, vviqQuestions3, vviqQuestions4]

const vviqOptions = [
    "1: No image at all, you only 'know' that you are thinking of the object.",
    "2: Vague and dim.",
    "3: Moderately clear and vivid.",
    "4: Clear and reasonably vivid.",
    "5: Perfectly clear and as vivid as normal vision."
];

const vviqScores = [1, 2, 3, 4, 5];


// Post-experiment imagery and engagement questions.
const finalQuestions = [
    "Independently of how you felt in this study, how would you describe your mental imagery in general?",
    "In what percentage did you actively try to imagine?",
    "In what percentage did you successfully form a mental image of the bar in the instructed positions?",
];
const finalOptions = [
    "I have no imagery at all.",
    "Vague and dim.",
    "Moderately clear and vivid.",
    "Clear and reasonably vivid.",
    "As vivid as normal vision.",
];
const percentageOptions = ["0%-20%", "20%-40%", "40%-60%", "60%-80%", "80%-100%"];

// Instruction illustration only; the bar is never rendered during trials.
function occluderIllustration(position = 'middle') {
    let markup = decodeURIComponent(gridStimulus().split(',')[1]);
    const cell = gridCellSize;
    const geometry = {
        middle: [2 * cell, cell, cell, 3 * cell],
        top: [cell, cell, 3 * cell, cell],
        bottom: [cell, 3 * cell, 3 * cell, cell],
        behind: [0, 2 * cell, 5 * cell, cell],
    }[position];
    const [x, y, width, height] = geometry;
    let bar = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${occluderColor}"/>`;
    if (position === 'behind') {
        // Redraw the squares in front of the imagined bar.
        for (const column of [1, 3]) {
            bar += `<rect x="${column * cell}" y="${2 * cell}" width="${cell}" height="${cell}" fill="${squareColor}"/>`;
        }
    }
    return svgDataUrl(markup.replace('</svg>', bar + taskFrameOutline() + '</svg>'));
}
