/* initialize jsPsych */
const jsPsych = initJsPsych({
    display_element: 'jspsych-target',
    on_finish: function() {
        if (save_data_locally === 'on') {
            jsPsych.data.get().localSave('csv', 'mydata.csv');
        }
        window.location.href = debriefURL;
    },
    exclusions: {
        min_width: 800,
        min_height: 600
    },
});

// capture info from Prolific
let subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
if (subject_id == null) subject_id = 20;
Math.seedrandom(subject_id); // Reproduce assignment and trial order for this participant.

const squareColor = Math.random() < 0.5 ? 'black' : 'white';
const occluderColor = squareColor === 'black' ? 'white' : 'black';
const blockOrder = shuffle([1, 2, 3, 4]); // 1: vertical/nothing, 2: vertical/occluded, 3: horizontal/nothing, 4: horizontal/occluded
const firstBlockCondition = blockOrder[0];
const study_id = jsPsych.data.getURLVariable('STUDY_ID');
const session_id = jsPsych.data.getURLVariable('SESSION_ID');
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
const screenHeight = screen.height;
const screenWidth = screen.width;
const browserInfo = getBrowser();
const browserName = browserInfo[0];
const browserVersion = browserInfo[1];

jsPsych.data.addProperties({
    subject_id: subject_id,
    online,
    task_mode: 'perception',
    pixels_per_cm: online === 'on' ? null : displayPixelsPerCm,
    viewing_distance_cm: viewingDistanceCm,
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
let linesOnsetTime;
let questionOnsetTime;
let trials = [];
let block1 = [];
let block2 = [];
let block3 = [];
let block4 = [];
let real_trial_num = 1;
const timeline = [];
let practice;
let blockNum;
let practice_trials;

// Start experiment with fullscreen.
const fullscreen_on = {
    type: jsPsychFullscreen,
    message: wellcome_text,
    button_label: 'Begin',
    fullscreen_mode: true,
    on_start: function() {
        $('#progressContainer').hide();
    },
};
timeline.push(fullscreen_on);

// Measure only after fullscreen has completed; continue when sampling finishes.
const frame_duration_check = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p>Please wait while we check your display.</p>',
    choices: 'NO_KEYS',
    data: {stage: 'frame_duration_check'},
    on_load: function() {
        estimate_frame_duration(function(frameDurationMs) {
            frame_duration = frameDurationMs;
            jsPsych.data.addProperties({frame_duration});
            jsPsych.finishTrial();
        }, 5000, true);
    },
};
timeline.push(frame_duration_check);

const frame_duration_exclusion = {
    type: jsPsychInstructions,
    pages: function() {
        if (Number.isFinite(frame_duration) && frame_duration > 0 && frame_duration < 17) {
            return [good_frame_text];
        } else {
            return [block_text];
        }
    },
    show_clickable_nav: function() {
        if (Number.isFinite(frame_duration) && frame_duration > 0 && frame_duration < 17) {
            return true;
        } else {
            return false;
        }
    },
    allow_keys: false,
};
timeline.push(frame_duration_exclusion);

if (online === 'on') {
    timeline.push(createScreenCalibration(jsPsych));
}
timeline.push({
    type: jsPsychCallFunction,
    func: function() {
        jsPsych.addNodeToEndOfTimeline({timeline: buildExperimentTimeline()}); // Construct images, instructions, and trials only after online calibration.
    },
    data: {stage: 'prepare_trials'},
});

// Construct images, instructions, and trials only after online calibration
function buildExperimentTimeline() {
    const taskTimeline = [];
    initializePerceptionInstructions();
    // /* preload images */
    const preloadImages = {
        type: jsPsychPreload,
        images: Object.keys(perceptionConditions).flatMap(condition => [
            perceptionStimulus(condition, null, false), perceptionStimulus(condition),
            ...linePairs.map(pair => perceptionStimulus(condition, pair)),
        ]),
    };
    taskTimeline.push(preloadImages);
    if (jump_to_questionnaire !== 'on') {
        taskTimeline.push({
            type: jsPsychInstructions,
            pages: perception_initial_instruction_pages(blockOrder.length),
            show_clickable_nav: true,
            data: {stage: 'initial_instructions'},
        });
    }

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
        choices: 'NO_KEYS',
        trial_duration: fixationDuration,
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'fixation'}),
    };
    const squares_stage = {
        type: jsPsychImageKeyboardResponse,
        render_on_canvas: false,
        css_classes: ['trial-frame'],
        stimulus: () => jsPsych.timelineVariable('squares_stimulus'),
        choices: 'NO_KEYS',
        trial_duration: () => jsPsych.timelineVariable('squares_duration'),
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'squares'}),
    };
    // Show the bar, or continue showing the squares in "nothing" trials.
    const perception_stage = {
        type: jsPsychImageKeyboardResponse,
        render_on_canvas: false,
        css_classes: ['trial-frame'],
        stimulus: () => jsPsych.timelineVariable('pre_probe_stimulus'),
        choices: 'NO_KEYS',
        trial_duration: () => jsPsych.timelineVariable('pre_probe_duration'),
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'perception'}),
    };
    function finishLineJudgment(data) {
        data.stage = 'judgment';
        data.response_status = data.response === null ? 'too_slow'
            : data.rt_from_lines <= minResponseTime ? 'too_fast' : 'valid';
        data.correct = data.response_status === 'valid'
            ? Number(jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)) : 0;
        if (data.isPractice === 'off') {
            $('#progressBar').css('width', (data.real_trial_num / trials.length) * 100 + '%');
        }
        if (save_data_locally !== 'on') saveData();
    }
    const lines_stage = {
        type: jsPsychImageKeyboardResponse,
        render_on_canvas: false,
        css_classes: ['trial-frame'],
        stimulus: () => jsPsych.timelineVariable('stimulus'),
        choices: [keySame, keyDifferent],
        response_ends_trial: true,
        trial_duration: () => jsPsych.timelineVariable('presentation_duration'),
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'lines'}),
        on_load: function() {
            linesOnsetTime = performance.now();
        },
        on_finish: function(data) {
            if (data.response !== null) {
                data.rt_from_lines = data.rt;
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
            response_ends_trial: true,
            data: () => ({...jsPsych.timelineVariable('data'), stage: 'judgment'}),
            on_load: function() {
                questionOnsetTime = performance.now();
            },
            on_finish: function(data) {
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
    function feedbackTrialData(stage) {
        const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
        return {
            ...jsPsych.timelineVariable('data'),
            stage,
            correct: judgment.correct,
            response_status: judgment.response_status,
        };
    }
    const too_fast_warning = {
        timeline: [{
            type: jsPsychHtmlKeyboardResponse,
            css_classes: ['trial-frame'],
            stimulus: '<div class="task-panel feedback-incorrect">Do not press the key before you see the lines.<br>Press the space bar to continue.</div>',
            choices: [' '],
            response_ends_trial: true,
            data: () => feedbackTrialData('too_fast_warning'),
        }],
        conditional_function: function() {
            const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
            return judgment.response_status === 'too_fast';
        },
    };
    const break_pause = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div></div>',
        choices: 'NO_KEYS',
        trial_duration: 750,
        data: {stage: 'break_pause'},
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
            data: () => feedbackTrialData('feedback'),
        }],
        conditional_function: function() {
            const judgment = jsPsych.data.get().filter({stage: 'judgment'}).last(1).values()[0];
            return judgment.isPractice !== 'off' && judgment.response_status === 'valid';
        },
    };

    // Full-task practice: view the bar and judge line lengths.
    practice_trials = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
        .map(pair => generate_trial('practice_block_1', pair, 1, firstBlockCondition));
    const practice_round = {
        timeline: [iti, fixation, squares_stage, perception_stage, lines_stage, test_stage, too_fast_warning, response_feedback],
        timeline_variables: practice_trials,
        randomize_order: true,
        data: {isPractice: 'practice_block_1'},
    };
    if (jump_to_questionnaire !== 'on') {
        taskTimeline.push({
            type: jsPsychInstructions,
            pages: full_practice_pages,
            show_clickable_nav: true,
            data: {stage: 'instructions', isPractice: 'practice_block_1'},
        });
        taskTimeline.push(practice_round);
    }

    // Generate each block separately so trial order never mixes bar conditions.
    practice = 'off';

    const blocks = [];
    for (blockNum = 1; blockNum <= blockOrder.length; blockNum++) {
        const condition = blockOrder[blockNum - 1];
        const blockTrials = [];
        for (let repetition = 0; repetition < repeatTimes; repetition++) {
            for (const lineLengths of linePairs) {
                blockTrials.push(generate_trial(practice, lineLengths, blockNum, condition));
            }
        }
        shuffle(blockTrials);
        if (review_mode === 'on') {
            blockTrials.splice(2);
        }
        blockTrials.forEach(trial => {
            trial.data.real_trial_num = real_trial_num++;
        });
        blocks.push(blockTrials);
    }
    [block1, block2, block3, block4] = blocks;
    trials = blocks.flat();

    // Main trials: identical response sequence, with block-specific bar displays.
    for (let index = 0; index < blockOrder.length; index++) {
        const blockNum = index + 1;
        const condition = blockOrder[index];
        const blockTrials = blocks[index];
        if (jump_to_questionnaire !== 'on') {
            taskTimeline.push(break_pause);
            taskTimeline.push({
                type: jsPsychInstructions,
                pages: blockInstructionPages(condition, blockNum),
                show_clickable_nav: true,
                data: {stage: 'block_instructions', block_num: blockNum},
                on_start: function() { $('#progressContainer').hide(); },
            });
            taskTimeline.push(break_pause);
            taskTimeline.push({
                timeline: [iti, fixation, squares_stage, perception_stage, lines_stage, test_stage, too_fast_warning],
                timeline_variables: blockTrials,
                randomize_order: false,
                on_timeline_start: function() { $('#progressContainer').show(); },
                data: {isPractice: 'off', block_num: blockNum},
            });
        }
    }

    function generate_trial(practice, lineLengths, blockNum, conditionId) {
        const {occlusion, orientation} = perceptionConditions[conditionId];
        const barDuration = practice === 'off' ? perceptionDuration : perceptionDurationPractice;
        const isSame = lineLengths[0] === lineLengths[1];
        return {
            stimulus: perceptionStimulus(conditionId, lineLengths),
            squares_stimulus: perceptionStimulus(conditionId, null, false),
            pre_probe_stimulus: perceptionStimulus(conditionId),
            squares_duration: squaresDuration,
            pre_probe_duration: barDuration,
            presentation_duration: practice === 'off' ? linesDuration : linesDurationPractice,
            data: {
                isPractice: practice,
                real_trial_num: 0,
                left_or_top_length_px: lineLengths[0],
                right_or_bottom_length_px: lineLengths[1],
                correct_response: isSame ? keySame : keyDifferent,
                block_num: blockNum,
                occlusion,
                orientation,
            },
        };
    }

    const thank_you = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: thank_you_text,
        choices: [' '],
        on_start: function() {
            $("#progressContainer").hide();
            document.documentElement.style.cursor = 'default';
        },
    };
    taskTimeline.push(thank_you);

    // Keep questionnaire answers in a single JSON response column.
    function saveQuestionnaire(data) {
        if (data.response !== null && typeof data.response === 'object') {
            data.response = JSON.stringify(data.response);
        }
        if (save_data_locally !== 'on') saveData();
    }

    const study_questionnaire = {
        css_classes: ['questionnaire-page'],
        type: jsPsychSurveyText,
        preamble: '<strong>Tell us more about your thoughts on the study.</strong>',
        questions: [
            // Imagery version asked about strategies for imagining the bar and comparing the lines.
            {prompt: '1. Did you use any particular strategy when comparing the line lengths?', name: 'general_strategy', rows: 3, columns: 90, required: true},
            // Imagery version asked about time provided for imagining the bar and viewing the lines.
            {prompt: '2. Do you feel you were able to follow the task instructions correctly?', name: 'instructions', rows: 3, columns: 90, required: true},
            {prompt: '3. Do you have any other comments about the experiment or how you felt doing it?', name: 'comments', rows: 3, columns: 90, required: false},
        ],
        data: {stage: 'study_questionnaire'},
        on_finish: saveQuestionnaire,
    };
    taskTimeline.push(study_questionnaire);

    const demographics = {
        css_classes: ['questionnaire-page'],
        type: jsPsychSurveyHtmlForm,
        html: demographics_html,
        button_label: 'Continue',
        data: {stage: 'demographics'},
        on_finish: saveQuestionnaire,
    };
    taskTimeline.push(demographics);

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
    taskTimeline.push(bufferPage);
    return taskTimeline;
}

// Function to save data after each trial
function saveData(done) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status == 200) {
            const response = JSON.parse(xhr.responseText);
            console.log(response.success);
        }
        if (typeof done === 'function') done();
    };

    // Get data from the last trial only and send it
    const lastTrialData = jsPsych.data.getLastTrialData().json();
    xhr.send(lastTrialData); // Send only the last trial's data
}

jsPsych.run(timeline);

/*
RETAINED IMAGERY VERSION — inactive reference code.
These fragments originally appeared at different points in the timeline.
Restore each section to its appropriate scope when rebuilding the imagery task.

// Original variable declarations and timeline sequences.
// Imagery version: const practiceImageryPosition = conditionPositions[firstBlockCondition];
// Imagery version: let practice_trials_1, practice_trials_2, practice_trials_3;
// Imagery version: let practice_trials_block_2, practice_trials_block_3;
// Imagery sequence: timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_fast_warning, response_feedback, rating_stage],
// Imagery sequence: timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_fast_warning, rating_stage],

// Imagery version retained for future use.
    const imagery_stage = {
        type: jsPsychImageKeyboardResponse,
        render_on_canvas: false, // Keep the SVG sharp on high-density displays.
        css_classes: ['trial-frame'],
        stimulus: gridStimulus(),
        choices: 'NO_KEYS',
        prompt: () => jsPsych.timelineVariable('data').isPractice === 'off'
            ? '' : `<p>${jsPsych.timelineVariable('imagery_cue')}</p>`,
        trial_duration: () => jsPsych.timelineVariable('imagery_duration'),
        data: () => ({...jsPsych.timelineVariable('data'), stage: 'imagery'}),
    };

// Imagery vividness ratings retained for future use.
    const rating_stage = {
        type: jsPsychHtmlButtonResponse,
        css_classes: ['trial-frame'],
        choices: ['1', '2', '3', '4', '5'],
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
            if (data.isPractice === 'off') {
                $("#progressBar").css("width", (data.real_trial_num / trials.length) * 100 + "%");
            }
            if (save_data_locally !== 'on') saveData();
        },
    };

// Imagery questionnaire retained; not scheduled in the perception task.
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
                data.response[name] = vviqScores[vviqOptions.indexOf(data.response[name])];
            });
            saveQuestionnaire(data);
        },
    }));
    if (jump_to_questionnaire !== 'on' && skip_vviq === 'off') {
        taskTimeline.push({
            type: jsPsychInstructions,
            pages: initial_instruction_pages(),
            show_clickable_nav: true,
            data: {stage: 'vviq_instructions'},
            on_start: function() {
                document.documentElement.style.cursor = 'default';
                $('#progressContainer').hide();
            },
        });
        taskTimeline.push(...(review_mode === 'on' ? vviqPages.slice(0, 1) : vviqPages));
    }

// Line-only practice retained for the future imagery task.
    // Practice round 1: line judgments only.
    practice_trials_1 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
        .map(pair => generate_trial('practice_lines', pair, 0, 'none'));
    const practice_round_1 = {
        timeline: [iti, fixation, lines_stage, test_stage, too_fast_warning, response_feedback],
        timeline_variables: practice_trials_1,
        randomize_order: true,
        data: {isPractice: 'practice_lines'},
    };
    if (jump_to_questionnaire !== 'on') {
        taskTimeline.push({
            type: jsPsychInstructions,
            pages: line_practice_pages,
            show_clickable_nav: true,
            data: {stage: 'instructions', isPractice: 'practice_lines'},
        });
        taskTimeline.push(practice_round_1);
    }

// Imagery-only practice retained for future use.
    // Practice round 2: imagery and vividness ratings only.
    practice_trials_2 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
        .map(pair => generate_trial('practice_imagery', pair, 1, practiceImageryPosition));
    const practice_round_2 = {
        timeline: [iti, fixation, imagery_stage, rating_stage],
        timeline_variables: practice_trials_2,
        randomize_order: true,
        data: {isPractice: 'practice_imagery'},
    };
    if (jump_to_questionnaire !== 'on') {
        taskTimeline.push({
            type: jsPsychInstructions,
            pages: imagery_practice_pages,
            show_clickable_nav: true,
            data: {stage: 'instructions', isPractice: 'practice_imagery'},
        });
        taskTimeline.push(practice_round_2);
    }

// Per-block practice retained for the future imagery task.
    // Full-task refreshers for the second and third blocks.
    practice_trials_block_2 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
        .map(pair => generate_trial('practice_block_2', pair, 2, conditionPositions[blockOrder[1]]));
    practice_trials_block_3 = linePairs.slice(0, review_mode === 'on' ? 1 : linePairs.length)
        .map(pair => generate_trial('practice_block_3', pair, 3, conditionPositions[blockOrder[2]]));

// Per-block practice scheduling retained for the future imagery task.
            if (index > 0) {
                const practiceTrials = index === 1 ? practice_trials_block_2 : practice_trials_block_3;
                taskTimeline.push(break_pause);
                taskTimeline.push({
                    // Imagery sequence: timeline: [iti, fixation, imagery_stage, lines_stage, test_stage, too_fast_warning, response_feedback, rating_stage],
                    timeline: [iti, fixation, perception_stage, lines_stage, test_stage, too_fast_warning, response_feedback],
                    timeline_variables: practiceTrials,
                    randomize_order: true,
                    data: {isPractice: `practice_block_${blockNum}`, block_num: blockNum},
                });
                taskTimeline.push(break_pause);
                taskTimeline.push({
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: afterBlockPracticeText(condition),
                    choices: [' '],
                    data: {stage: 'after_block_practice', block_num: blockNum},
                });
            }

// Original imagery trial generation retained for future use.
    function generate_trial(practice, lineLengths, blockNum, position) {
        const isSame = lineLengths[0] === lineLengths[1];
        const presentationDuration = practice === 'practice_lines' ? linesDurationPractice : linesDuration;
        const imaginationDuration = practice !== 'off' ? imageryDurationPractice : imageryDuration;
        const imageryCues = {
            none: '',
            middle: `Imagine a ${occluderColor} vertical bar in the MIDDLE`,
            top: `Imagine a ${occluderColor} horizontal bar at the TOP`,
            behind: `Imagine a ${occluderColor} horizontal bar BEHIND the squares`,
        };
        return {
            stimulus: gridStimulus(lineLengths),
            imagery_cue: imageryCues[position],
            presentation_duration: presentationDuration,
            imagery_duration: imaginationDuration,
            data: {
                isPractice: practice,
                real_trial_num: 0,
                line_1_length_px: lineLengths[0],
                line_2_length_px: lineLengths[1],
                correct_response: isSame ? keySame : keyDifferent,
                block_num: blockNum,
                condition: practice === 'practice_lines' ? 'none' : position,
            },
        };
    }

// Imagery-experience questionnaire retained for future use.
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
        on_finish: saveQuestionnaire,
    };
    taskTimeline.push(projectorQuestion);

// Final imagery questions retained for future use.
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
                data.response[name] = options.indexOf(data.response[name]) + 1;
            });
            saveQuestionnaire(data);
        },
    };
    taskTimeline.push(finalQuestionsPage);
*/
