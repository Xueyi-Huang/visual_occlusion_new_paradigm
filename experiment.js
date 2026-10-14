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
    images: [gridStimulus(), ...Array.from({length: 4}, (_, i) => generate_trial('off', 1, i + 1, 1).stimulus)],
};
timeline.push(preloadImages);

// A probe is shown without accepting responses, then replaced by the judgment screen.
const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['trial-frame'],
    stimulus: fixationText,
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
    prompt: '<p>Imagine occluder</p>',
    trial_duration: imageryDuration,
    data: {stage: 'imagery'},
};
const lines_stage = {
    type: jsPsychImageKeyboardResponse,
    render_on_canvas: false,
    css_classes: ['trial-frame'],
    stimulus: jsPsych.timelineVariable('stimulus'),
    prompt: '<p>lines stage</p>',
    choices: "NO_KEYS",
    trial_duration: linesDuration,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'presentation'}),
};
const test_stage = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['trial-frame'],
    stimulus: '<div class="task-panel">Same or different<br>length?</div>',
    choices: [keySame, keyDifferent],
    prompt: promptKey,
    trial_duration: maxResponseTime,
    response_ends_trial: true,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'judgment'}),
    on_finish: function(data) {
        data.timed_out = data.response === null;
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        data.trial_num = real_trial_num++;
        if (save_data_locally !== "on") saveData();
    },
};
const too_slow_warning = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['trial-frame'],
        stimulus: '<div class="task-panel">Too slow!<br>Press the space bar to continue.</div>',
        choices: [' '],
        response_ends_trial: true,
        data: {stage: 'too_slow_warning'},
    }],
    conditional_function: function() {
        return jsPsych.data.getLastTrialData().values()[0].timed_out === true;
    },
};
const rating_stage = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ['trial-frame'],
    choices: ["1", "2", "3", "4", "5"],
    stimulus: HowVivid,
    prompt: promptVivdness,
    data: () => ({...jsPsych.timelineVariable('data'), stage: 'vividness'}),
    on_start: function() {
        document.documentElement.style.cursor = 'default';
    },
    on_finish: function(data) {
        data.rating = Number(data.response) + 1;
        const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
        data.trial_num = judgment.trial_num;
        $("#progressBar").css("width", (data.trial_num / trials.length) * 100 + "%");
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
if (jump_to_questionnaire != "on") {
    timeline.push(frame_duration_exclusion);
}


// Quick demo version: no practice instructions or extra blocks.

// make real trials
practice = "off";
for (blockNum = 1; blockNum <= maxBlockNum; blockNum++){
    for (let r = 0; r < repeatTimes; r++){
        for (let i = 1; i <= primeNum; i++) {
            for (let j = 1; j <= testNum; j++) {
                let trial = generate_trial(practice, i, j, blockNum);
                trials.push(trial);
            }
        }
    }
}
const shuffleTrials = shuffle(trials);
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

let trial_structure = {
    timeline: [fixation, imagery_stage, lines_stage, test_stage, too_slow_warning, rating_stage],
};

timeline.push({
    timeline: [trial_structure],
    timeline_variables: block1,
    randomize_order: false
});


// Visual demo: equal lengths and both directions of inequality.
function generate_trial(practice, primeIndex, testIndex, blockNum) {
    const imagery_position = imageryPositions[primeIndex - 1];
    const lineLengths = [
        [sameLineLength, sameLineLength],
        [differentLineLength, differentLineLength],
        [sameLineLength, differentLineLength],
        [differentLineLength, sameLineLength],
    ][testIndex - 1];
    const isSame = lineLengths[0] === lineLengths[1];
    return {
        imagery_position,
        stimulus: gridStimulus(lineLengths),
        data: {
            isPractice: practice,
            imagery_position,
            left_line_length_px: lineLengths[0],
            right_line_length_px: lineLengths[1],
            presentation_duration_ms: linesDuration,
            correct_response: isSame ? keySame : keyDifferent,
            correct_answer: isSame ? 'same' : 'different',
            test_type: testIndex,
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
