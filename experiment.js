/* initialize jsPsych */
let jsPsych = initJsPsych({
    display_element: 'jspsych-target',
    on_finish: function() {
        window.location.href = debriefURL;
        if (save_data_locally == "on"){
            jsPsych.data.get().localSave('csv','mydata.csv');
        }
    },
    exclusions: {
        min_width: 920,
        min_height: 620
    }
})

// capture info from Prolific
let subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
if (subject_id == null){ // if not on Prolific, there will be no subject_id. But I still need one to shuffle the trials.
    subject_id = 0;
}
Math.seedrandom(subject_id); // shuffle the trials in a certain order
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
let trials = [];
let block1 = [];
let block2 = [];
let block3 = [];
let block4 = [];
let real_trial_num = 1;
let timeline = [];
let practice;
let blockNum;
const maxBlockNum = 1;

// /* preload images */
let preloadImages = {
    type: jsPsychPreload,
    images: [gridStimulus(), ...linePairs.map(lineLengths => gridStimulus(lineLengths))],
};
timeline.push(preloadImages);

// A probe is shown without accepting responses, then replaced by the judgment screen.
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
    prompt: '<p>Imagine an occluder in the middle</p>',
    trial_duration: imageryDuration,
    data: {stage: 'imagery'},
};
const lines_stage = {
    type: jsPsychImageKeyboardResponse,
    render_on_canvas: false,
    css_classes: ['trial-frame'],
    stimulus: jsPsych.timelineVariable('stimulus'),
    prompt: '<p>Compare the two red lines</p>',
    choices: "NO_KEYS",
    trial_duration: linesDuration,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'presentation'}),
};
const test_stage = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['trial-frame'],
    stimulus: '<div class="task-panel">Same or different length?</div>',
    choices: [keySame, keyDifferent],
    prompt: '<p>S = Same, D = Different</p>',
    trial_duration: maxResponseTime,
    response_ends_trial: true,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'judgment'}),
    on_finish: function(data) {
        data.timed_out = data.response === null;
        data.too_fast = !data.timed_out && data.rt !== null && data.rt <= minResponseTime;
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        data.trial_num = data.isPractice === 'off' ? real_trial_num++ : 0;
        if (save_data_locally !== "on") saveData();
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
        return jsPsych.data.getLastTrialData().values()[0].timed_out === true;
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
    prompt: '<p>1 (Not vivid at all) - 5 (Perfectly vivid)</p>',
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
        const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
        data.trial_num = judgment.trial_num;
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
        }, 500, true);
        $("#progressbar").hide();
    },
    delay_after: 500
};
if (jump_to_questionnaire != "on") {
    timeline.push(fullscreen_on);
}

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
    timeline: [fixation, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback],
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

// Practice round 2: imagery, line judgments, and vividness ratings.
const practice_trials_2 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
    .map(pair => generate_trial('practice_imagery', pair, 0));
const practice_round_2 = {
    timeline: [fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback, rating_stage],
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

// make real trials
practice = "off";
for (blockNum = 1; blockNum <= maxBlockNum; blockNum++){
    for (let r = 0; r < repeatTimes; r++){
        for (const lineLengths of linePairs) {
            let trial = generate_trial(practice, lineLengths, blockNum);
            trials.push(trial);
        }
    }
}
const shuffleTrials = shuffle(trials);
if (review_mode === 'on') {
    trials.splice(2); // Keep the progress total consistent with the shortened main task.
}
block1 = shuffleTrials;
block2 = [];
block3 = [];
block4 = [];


// start block 1
let before_block_instruction_1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: before_block_text_1,
    choices: [" "],
    post_trial_gap: 2000,
    on_finish: function() {
        $("#progressContainer").show();
    },
};
if (jump_to_questionnaire != "on") {
    timeline.push(before_block_instruction_1);
}

// Real trials: the same sequence as practice round 2.
const real_trials = {
    timeline: [fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, too_fast_warning, response_feedback, rating_stage],
    timeline_variables: block1,
    randomize_order: false,
};
timeline.push(real_trials);


// Visual demo: equal lengths and both directions of inequality.
function generate_trial(practice, lineLengths, blockNum) {
    const isSame = lineLengths[0] === lineLengths[1];
    return {
        stimulus: gridStimulus(lineLengths),
        data: {
            isPractice: practice,
            left_line_length_px: lineLengths[0],
            right_line_length_px: lineLengths[1],
            presentation_duration_ms: linesDuration,
            correct_response: isSame ? keySame : keyDifferent,
            correct_answer: isSame ? 'same' : 'different',
            trial_condition: blockNum,
        },
    };
}

let thank_you = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: thank_you_text,
    choices: [" "],
    on_start: function() {
        $("#progressContainer").hide();
    }
};
timeline.push(thank_you);

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
