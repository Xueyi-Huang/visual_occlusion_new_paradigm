/* initialize jsPsych */
let jsPsych = initJsPsych({
    display_element: 'jspsych-target',
    on_finish: function() {
        if (save_data_locally == "on"){
            jsPsych.data.get().localSave('csv','mydata.csv');
        }
        window.location.href = debriefURL;
    },
    exclusions: {
        min_width: 920,
        min_height: 620
    }
})

// capture info from Prolific
let subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
if (subject_id == null) subject_id = 1200;
Math.seedrandom(subject_id); // Reproduce assignment and trial order for this participant.
const squareColor = Math.random() < 0.5 ? 'black' : 'white';
const occluderColor = squareColor === 'black' ? 'white' : 'black';
const blockOrder = shuffle([1, 2, 3]); // Condition IDs in participant-specific presentation order.
const firstBlockCondition = blockOrder[0];
const practiceImageryPosition = {1: 'middle', 2: 'top', 3: 'behind'}[firstBlockCondition];
initializeTaskInstructions();
let study_id = jsPsych.data.getURLVariable('STUDY_ID');
let session_id = jsPsych.data.getURLVariable('SESSION_ID');
let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
let screenHeight = screen.height;
let screenWidth = screen.width;
let browserInfo = getBrowser();
let browserName = browserInfo[0];
let browserVersion = browserInfo[1];

jsPsych.data.addProperties({
    subject_id: subject_id,
    block_order: blockOrder.join('-'),
    square_color: squareColor,
    occluder_color: occluderColor,
    study_id: study_id,
    session_id: session_id,
    windowHeight: windowHeight,
    windowWidth: windowWidth,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    browserName: browserName,
    browserVersion: browserVersion,
});

let frame_duration;
let frame_rate;
let linesOnsetTime;
let questionOnsetTime;
let trials = [];
let block1 = [];
let block2 = [];
let block3 = [];
let real_trial_num = 1;
let timeline = [];
let practice;
let blockNum;
const maxBlockNum = 3;

// /* preload images */
let preloadImages = {
    type: jsPsychPreload,
    images: [gridStimulus(), ...linePairs.map(lineLengths => gridStimulus(lineLengths))],
};
timeline.push(preloadImages);

// Responses are accepted from line onset; show the question only if still unanswered.
const iti = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['trial-frame'],
    stimulus: '<div class="task-panel"></div>',
    choices: 'NO_KEYS',
    trial_duration: itiDuration,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'iti'}),
};

const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['trial-frame'],
    stimulus: '<div class="task-panel fixation-text">+</div>',
    choices: "NO_KEYS",
    trial_duration: fixationDuration,
    data: {stage: 'fixation'},
};
const imagery_stage = {
    type: jsPsychImageKeyboardResponse,
    render_on_canvas: false, // Keep the SVG sharp on high-density displays.
    css_classes: ['trial-frame'],
    stimulus: gridStimulus(),
    choices: "NO_KEYS",
    prompt: () => jsPsych.timelineVariable('data').isPractice === 'off'
        ? '' : `<p>${jsPsych.timelineVariable('imagery_cue')}</p>`,
    trial_duration: () => jsPsych.timelineVariable('imagery_duration'),
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'imagery'}),
};
function finishLineJudgment(data) {
    data.stage = 'judgment';
    data.timed_out = data.response === null;
    data.too_fast = !data.timed_out && data.rt_from_lines <= minResponseTime;
    data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
    data.trial_num = data.isPractice === 'off' ? real_trial_num++ : 0;
    if (save_data_locally !== 'on') saveData();
}

const lines_stage = {
    type: jsPsychImageKeyboardResponse,
    render_on_canvas: false,
    css_classes: ['trial-frame'],
    stimulus: jsPsych.timelineVariable('stimulus'),
    prompt: () => jsPsych.timelineVariable('data').isPractice === 'off'
        ? '' : '<p>Compare the two red lines</p>',
    choices: [keySame, keyDifferent],
    response_ends_trial: true,
    trial_duration: () => jsPsych.timelineVariable('presentation_duration'),
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'presentation'}),
    on_load: function() {
        linesOnsetTime = performance.now();
    },
    on_finish: function(data) {
        if (data.response !== null) {
            data.response_stage = 'lines';
            data.rt_from_lines = data.rt;
            data.rt_from_question = null;
            finishLineJudgment(data);
        }
    },
};
const test_stage = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['trial-frame'],
        stimulus: '<div class="task-panel">Same or Different?</div>',
        choices: [keySame, keyDifferent],
        prompt: () => jsPsych.timelineVariable('data').isPractice === 'off'
            ? '' : '<p>S = Same, D = Different</p>',
        trial_duration: () => jsPsych.timelineVariable('response_duration'),
        response_ends_trial: true,
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'judgment'}),
        on_load: function() {
            questionOnsetTime = performance.now();
        },
        on_finish: function(data) {
            data.response_stage = 'question';
            data.rt_from_question = data.rt;
            data.rt_from_lines = data.response !== null && data.rt !== null
                ? questionOnsetTime - linesOnsetTime + data.rt : null;
            data.rt = data.rt_from_lines; // All judgment RTs use line onset.
            finishLineJudgment(data);
        },
    }],
    conditional_function: function() {
        return jsPsych.data.getLastTrialData().values()[0].response === null;
    },
};
const too_slow_warning = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['trial-frame'],
        stimulus: '<div class="task-panel feedback-incorrect">Too slow!<br>Press the space bar to continue.</div>',
        choices: [' '],
        response_ends_trial: true,
        data: {stage: 'too_slow_warning'},
    }],
    conditional_function: function() {
        const judgment = jsPsych.data.getLastTrialData().values()[0];
        return (judgment.isPractice === 'off' || judgment.isPractice === 'practice_block' || judgment.isPractice === 'practice_full')
            && judgment.timed_out === true;
    },
};
const too_fast_warning = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['trial-frame'],
        stimulus: '<div class="task-panel feedback-incorrect">Do not press the key before you see the lines.<br>Press the space bar to continue.</div>',
        choices: [' '],
        response_ends_trial: true,
        data: {stage: 'too_fast_warning'},
    }],
    conditional_function: function() {
        const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
        return judgment.too_fast === true;
    },
};
const response_feedback = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['trial-frame'],
        stimulus: function() {
            const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
            return `<div class="task-panel ${judgment.correct ? 'feedback-correct' : 'feedback-incorrect'}">${judgment.correct ? 'Correct!' : 'Incorrect'}</div>`;
        },
        choices: 'NO_KEYS',
        trial_duration: feedbackDuration,
        data: function() {
            const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
            return {stage: 'feedback', correct: judgment.correct, trial_num: judgment.trial_num};
        },
    }],
    conditional_function: function() {
        const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
        return !judgment.timed_out && !judgment.too_fast;
    },
};
const rating_stage = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ['trial-frame'],
    choices: ["1", "2", "3", "4", "5"],
    stimulus: '<div class="task-panel rating-panel">How vivid?</div>',
    prompt: () => jsPsych.timelineVariable('data').isPractice === 'off'
        ? '' : '<p>1 (Not vivid at all) - 5 (Perfectly vivid)</p>',
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'vividness'}),
    on_start: function() {
        document.documentElement.style.cursor = 'default';
    },
    on_load: function() {
        const panel = document.querySelector('.rating-panel');
        const buttons = document.getElementById('jspsych-html-button-response-btngroup');
        panel.appendChild(buttons);
    },
    on_finish: function(data) {
        data.rating = Number(data.response) + 1;
        if (data.isPractice === 'practice_imagery') {
            data.trial_num = 0;
        } else {
            const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
            data.trial_num = judgment.trial_num;
        }
        if (data.isPractice === "off") {
            $("#progressBar").css("width", (data.trial_num / trials.length) * 100 + "%");
        }
        if (save_data_locally !== "on") saveData();
    },
};

// Start experiment with fullscreen.
let fullscreen_on = {
    type: jsPsychFullscreen,
    message: wellcome_text,
    button_label: "Begin",
    fullscreen_mode: true,
    on_start: function() {
        estimate_frame_duration(function(frame_rate) {
            frame_duration = frame_rate;
            console.log("Estimated frame duration: ", frame_rate);
        }, 5000, true);
        $("#progressbar").hide();
    },
    delay_after: 5000
};
timeline.push(fullscreen_on);

let frame_duration_exclusion = {
    type: jsPsychInstructions,
    pages: function() {
        if (frame_duration < 17) {
            return [good_frame_text];
        } else {
            return [block_text];
        }
    },
    show_clickable_nav: function() {
        if (frame_duration < 17) {
            return true;
        } else {
            return false;
        }
    },
    allow_keys: false,
    on_finish: function() {
        jsPsych.data.addProperties({
            frame_duration: frame_duration,
        });
    }
};
// if (jump_to_questionnaire != "on") {
//     timeline.push(frame_duration_exclusion);
// }


// VVIQ: four scenes with four required ratings each.
const vviqPages = vviqQuestions.map((questions, pageIndex) => ({
    type: jsPsychSurveyMultiChoice,
    css_classes: ['vviq-page'],
    preamble: `<div class="vviq_preamble"><p>${vviqItems[pageIndex]}</p><p>Rate the vividness of each detail.</p></div>`,
    questions: questions.map((prompt, itemIndex) => ({
        prompt,
        name: `vviq${pageIndex * 4 + itemIndex + 1}`,
        options: vviqOptions,
        required: true,
    })),
    data: {stage: 'vviq', vviq_page: pageIndex + 1},
    button_label: 'Continue',
    on_finish: function(data) {
        questions.forEach((_, itemIndex) => {
            const name = `vviq${pageIndex * 4 + itemIndex + 1}`;
            data[name] = vviqScores[vviqOptions.indexOf(data.response[name])];
        });
        data.responses = JSON.stringify(data.response);
        if (save_data_locally !== 'on') saveData();
    },
}));
if (jump_to_questionnaire !== 'on' && skip_vviq === 'off') {
    timeline.push({
        type: jsPsychInstructions,
        pages: initial_instruction_pages(),
        show_clickable_nav: true,
        data: {stage: 'vviq_instructions'},
        on_start: function() {
            document.documentElement.style.cursor = 'default';
            $('#progressContainer').hide();
        },
    });
    timeline.push(...vviqPages);
}

// Practice round 1: line judgments only.
const practice_trials_1 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_lines', pair, 0));
const practice_round_1 = {
    timeline: [iti, fixation, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback],
    timeline_variables: practice_trials_1,
    randomize_order: true,
    data: {isPractice: 'practice_lines'},
};
if (jump_to_questionnaire !== 'on') {
    timeline.push({
        type: jsPsychInstructions,
        pages: line_practice_pages,
        show_clickable_nav: true,
        data: {stage: 'instructions', isPractice: 'practice_lines'},
    });
    timeline.push(practice_round_1);
}

// Practice round 2: imagery and vividness ratings only.
const practice_trials_2 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_imagery', pair, firstBlockCondition, practiceImageryPosition));
const practice_round_2 = {
    timeline: [iti, fixation, imagery_stage, rating_stage],
    timeline_variables: practice_trials_2,
    randomize_order: true,
    data: {isPractice: 'practice_imagery'},
};
if (jump_to_questionnaire !== 'on') {
    timeline.push({
        type: jsPsychInstructions,
        pages: imagery_practice_pages,
        show_clickable_nav: true,
        data: {stage: 'instructions', isPractice: 'practice_imagery'},
    });
    timeline.push(practice_round_2);
}

// Practice round 3: combine imagery, line judgments, and vividness ratings.
const practice_trials_3 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_full', pair, firstBlockCondition, practiceImageryPosition));
const practice_round_3 = {
    timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback, rating_stage],
    timeline_variables: practice_trials_3,
    randomize_order: true,
    data: {isPractice: 'practice_full'},
};
if (jump_to_questionnaire !== 'on') {
    timeline.push({
        type: jsPsychInstructions,
        pages: full_practice_pages,
        show_clickable_nav: true,
        data: {stage: 'instructions', isPractice: 'practice_full'},
    });
    timeline.push(practice_round_3);
}

// Generate each block separately so trial order never mixes imagery conditions.
practice = 'off';
const blocks = [];
for (blockNum = 1; blockNum <= maxBlockNum; blockNum++) {
    const blockTrials = [];
    for (let repetition = 0; repetition < repeatTimes; repetition++) {
        for (const lineLengths of linePairs) {
            const position = blockNum === 1 ? 'middle'
                : blockNum === 2 ? 'top' : 'behind';
            blockTrials.push(generate_trial(practice, lineLengths, blockNum, position));
        }
    }
    shuffle(blockTrials);
    if (review_mode === 'on') {
        blockTrials.splice(2);
    }
    blocks.push(blockTrials);
}
[block1, block2, block3] = blocks;
trials = blocks.flat();

// Full-task refreshers for the second and third presented blocks.
const practice_trials_block_2 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_block', pair, blockOrder[1], {1: 'middle', 2: 'top', 3: 'behind'}[blockOrder[1]]));
const practice_trials_block_3 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_block', pair, blockOrder[2], {1: 'middle', 2: 'top', 3: 'behind'}[blockOrder[2]]));

// Real trials: identical response sequence, with block-specific imagery cues.
for (let index = 0; index < blockOrder.length; index++) {
    const condition = blockOrder[index];
    const blockTrials = blocks[condition - 1];
    blockTrials.forEach(trial => { trial.data.block_position = index + 1; });
    if (jump_to_questionnaire !== 'on') {
        timeline.push({
            type: jsPsychInstructions,
            pages: blockInstructionPages(condition, index + 1),
            show_clickable_nav: true,
            data: {stage: 'block_instructions', block_num: condition, block_position: index + 1},
            on_start: function() { $('#progressContainer').hide(); },
        });
        if (index > 0) {
            const practiceTrials = index === 1 ? practice_trials_block_2 : practice_trials_block_3;
            practiceTrials.forEach(trial => { trial.data.block_position = index + 1; });
            timeline.push({
                timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback, rating_stage],
                timeline_variables: practiceTrials,
                randomize_order: true,
                data: {isPractice: 'practice_block', block_num: condition, block_position: index + 1},
            });
            timeline.push({
                type: jsPsychHtmlKeyboardResponse,
                stimulus: afterBlockPracticeText(index + 1, condition),
                choices: [' '],
                data: {stage: 'after_block_practice', block_num: condition, block_position: index + 1},
            });
        }
        timeline.push({
            timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback, rating_stage],
            timeline_variables: blockTrials,
            randomize_order: false,
            on_timeline_start: function() { $('#progressContainer').show(); },
            data: {isPractice: 'off', block_num: condition, block_position: index + 1},
        });
    }
}

function generate_trial(practice, lineLengths, blockNum, position = 'middle') {
    const isSame = lineLengths[0] === lineLengths[1];
    const presentationDuration = practice === 'practice_lines' ? linesDurationPractice : linesDuration;
    const responseDuration = practice === 'off' || practice === 'practice_block' || practice === 'practice_full' ? maxResponseTime : null;
    const imaginationDuration = practice !== 'off' ? imageryDurationPractice : imageryDuration;
    const imageryCues = {
        middle: `Imagine a ${occluderColor} vertical bar in the MIDDLE`,
        top: `Imagine a ${occluderColor} horizontal bar at the TOP`,
        bottom: `Imagine a ${occluderColor} horizontal bar at the BOTTOM`,
        behind: `Imagine a ${occluderColor} horizontal bar BEHIND the squares`,
    };
    return {
        imagery_cue: imageryCues[position],
        presentation_duration: presentationDuration,
        response_duration: responseDuration,
        imagery_duration: imaginationDuration,
        stimulus: gridStimulus(lineLengths),
        data: {
            isPractice: practice,
            left_line_length_px: lineLengths[0],
            right_line_length_px: lineLengths[1],
            presentation_duration_ms: presentationDuration,
            response_duration_ms: responseDuration,
            imagery_duration_ms: practice === 'practice_lines' ? 0 : imaginationDuration,
            correct_response: isSame ? keySame : keyDifferent,
            correct_answer: isSame ? 'same' : 'different',
            trial_condition: blockNum,
            block_num: blockNum,
            imagery_position: practice === 'practice_lines' ? 'none' : position,
        },
    };
}

let thank_you = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: thank_you_text,
    choices: [" "],
    on_start: function() {
        $("#progressContainer").hide();
        document.documentElement.style.cursor = 'default';
    }
};
timeline.push(thank_you);

// Closing questionnaires: keep text responses alongside any numeric scores.
function saveQuestionnaire(data) {
    data.responses = JSON.stringify(data.response);
    if (save_data_locally !== 'on') saveData();
}

const projectorQuestion = {
    css_classes: ['questionnaire-page'],
    type: jsPsychSurveyMultiChoice,
    preamble: 'Please tell us about your mental imagery experience.',
    questions: [{
        prompt: 'Was your imagery more like a projection on a screen or more like something inside your head?',
        name: 'projector_type',
        options: ['a projection on a screen', 'something inside my head', 'both', 'neither'],
        required: true,
    }],
    data: {stage: 'imagery_experience'},
    button_label: 'Continue',
    on_finish: function(data) {
        data.projector_type = data.response.projector_type;
        saveQuestionnaire(data);
    },
};
timeline.push(projectorQuestion);

const study_questionnaire = {
    css_classes: ['questionnaire-page'],
    type: jsPsychSurveyText,
    preamble: '<strong>Tell us more about your thoughts on the study.</strong>',
    questions: [
        {prompt: '1. Did you use any particular strategy when imagining the bar or comparing the line lengths?', name: 'general_strategy', rows: 3, columns: 90, required: true},
        {prompt: '2. How did you feel about the time provided for imagining the bar and viewing the lines?', name: 'timing', rows: 3, columns: 90, required: true},
        {prompt: '3. Do you feel you were able to follow the task instructions correctly?', name: 'instructions', rows: 3, columns: 90, required: true},
        {prompt: '4. Do you have any other comments about the experiment or how you felt doing it?', name: 'comments', rows: 3, columns: 90, required: false},
    ],
    data: {stage: 'study_questionnaire'},
    on_finish: saveQuestionnaire,
};
timeline.push(study_questionnaire);

const demographics = {
    css_classes: ['questionnaire-page'],
    type: jsPsychSurveyHtmlForm,
    html: demographics_html,
    button_label: 'Continue',
    data: {stage: 'demographics'},
    on_finish: saveQuestionnaire,
};
timeline.push(demographics);

const finalQuestionsPage = {
    css_classes: ['questionnaire-page'],
    type: jsPsychSurveyMultiChoice,
    preamble: 'Your answers to these questions will not affect your reward. Please answer honestly.',
    questions: finalQuestions.map((prompt, index) => ({
        prompt,
        name: `final_q_${index + 1}`,
        options: index === 0 ? finalOptions : percentageOptions,
        required: true,
    })),
    data: {stage: 'final_questions'},
    button_label: 'Continue',
    on_finish: function(data) {
        finalQuestions.forEach((_, index) => {
            const options = index === 0 ? finalOptions : percentageOptions;
            const name = `final_q_${index + 1}`;
            data[name] = options.indexOf(data.response[name]) + 1;
        });
        saveQuestionnaire(data);
    },
};
timeline.push(finalQuestionsPage);

const bufferPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: buffer_text,
    choices: ['Submit'],
    data: {stage: 'submission'},
    on_load: function() {
        const button = document.querySelector('#jspsych-html-button-response-btngroup button');
        button.disabled = true;
        jsPsych.pluginAPI.setTimeout(() => { button.disabled = false; }, 3000);
    },
    on_finish: function() {
        if (save_data_locally !== 'on') saveData();
    },
};
timeline.push(bufferPage);

// Function to save data after each trial
function saveData(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response.success);
        }
        if (typeof done === "function") done();
    };

    // Get data from the last trial only and send it
    let lastTrialData = jsPsych.data.getLastTrialData().json();
    xhr.send(lastTrialData); // Send only the last trial's data
}

jsPsych.run(timeline);
