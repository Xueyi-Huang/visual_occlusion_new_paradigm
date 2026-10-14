/* initialize jsPsych */
let jsPsych = initJsPsych({
    display_element: 'progressContainer',
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
let trials_1 = [];
let trials_2 = [];  
let trials_3 = [];
let trials_4 = [];
let practice_1_trials = [];
let practice_2_trials = [];
let practice_3_trials = [];
let block1 = [];
let block2 = [];
let block3 = [];
let block4 = [];
let real_trial_num = 1;
let timeline = [];
let practice;
let blockNum;

// /* preload images */
let preloadImages = {
    type: jsPsychPreload,
    images: [testImages, noPrimeImages, primeSepImages, primeOccImages, fixationImage, bigAnchorImage, smallAnchorImage, illustrationImage, boxImage, illustrationGif], 
};
timeline.push(preloadImages);

// trial structure
let iti = {
    type: jsPsychImageKeyboardResponse,
    choices: "NO_KEYS",
    prompt: jsPsych.timelineVariable('prompt_iti'),
    trial_duration: itiDuration,
    stimulus: boxImage,
};
let fixation = {
    type: jsPsychImageKeyboardResponse,
    stimulus: fixationImage,
    choices: "NO_KEYS",
    prompt: jsPsych.timelineVariable('prompt_fixation'),
    trial_duration: fixationDuration,
};
let gap1 = {
    type: jsPsychImageKeyboardResponse,
    choices: "NO_KEYS",
    prompt: jsPsych.timelineVariable('prompt_gap1'),
    trial_duration: afterFixationInterval,
    stimulus: boxImage,
};
let image_stage = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('prime_image'),
    choices: "NO_KEYS",
    data: jsPsych.timelineVariable("data"),
    prompt: jsPsych.timelineVariable('prompt_image_stage'),
    trial_duration: jsPsych.timelineVariable('image_duration'),
};
let gap2 = { // for imagery experiments, gap 2 is the imagination time
    type: jsPsychImageKeyboardResponse,
    choices: "NO_KEYS",
    prompt: jsPsych.timelineVariable('prompt_gap2'),
    stimulus: jsPsych.timelineVariable('anchor_image'),
    trial_duration: jsPsych.timelineVariable('imagery_duration'),
};
let gap3 = {
    type: jsPsychImageKeyboardResponse,
    choices: "NO_KEYS",
    prompt: jsPsych.timelineVariable('prompt_gap3'),
    trial_duration: gap3Duration,
    stimulus: boxImage,
};
let test_stage = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [keySame, keyDifferent],
    prompt: jsPsych.timelineVariable('prompt_test_stage'),
    trial_duration: jsPsych.timelineVariable('trial_duration'),
    data: jsPsych.timelineVariable("data"),
    on_finish: function(data){
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        if (data.isPractice == "practice_1" || data.isPractice == "practice_2" || data.isPractice == "practice_3"){
            data.trial_num = 0;
        } else {
            data.trial_num = real_trial_num ++;     
        }
        $("#progressBar").css(
            "width",
            ((real_trial_num - 1) / (block1.length + block2.length + block3.length + block4.length)) * 100 + "px"
        );
        if (save_data_locally != "on"){
            saveData();
        }
    }
};
let feedback = {
    type: jsPsychHtmlKeyboardResponse,
    choices: function() {
        const choice_info = jsPsych.data.getLastTrialData().values()[0];
        if ((choice_info.response != null && choice_info.rt < tooFastResponseTime) || (choice_info.response == null)){
            return [" "];
        } else {
            return "NO_KEYS";
        }
    },
    trial_duration: function (){
        const choice_info = jsPsych.data.getLastTrialData().values()[0];
        if (choice_info.correct == true && choice_info.rt >= tooFastResponseTime){
            return correctDuration;
        } else if (choice_info.correct == false && choice_info.response != null && choice_info.rt >= tooFastResponseTime){
            return incorrectDuration;
        }
    },
    stimulus: function() {
        const choice_info = jsPsych.data.getLastTrialData().values()[0];
        if (choice_info.correct == true && choice_info.rt >= tooFastResponseTime) { // correct
            let feedbackRT = choice_info.rt;
            let correctFeedback = '<div style="color: green; font-size: 16pt; border: 8px solid green; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">Correct <br> Reaction Time: ' + feedbackRT + 'ms.' + '</div>';
            return correctFeedback ;
        } else if (choice_info.response != null && choice_info.rt < tooFastResponseTime) { // too fast
            return tooFastFeedback;
        } else if (choice_info.response == null) { // too slow
            return tooSlowFeedback;
        } else { // incorrect
            return incorrectFeedback;
        }
    },
    prompt: jsPsych.timelineVariable('prompt_feedback'),
};
let rating_stage = {
    type: jsPsychHtmlButtonResponse,
    show_clickable_nav: true,
    choices: ["1", "2", "3", "4", "5"],
    stimulus: HowVivid,
    prompt: jsPsych.timelineVariable('prompt_rating_stage'),
    data: jsPsych.timelineVariable("data"),
    on_start: function() {
        document.documentElement.style.cursor = 'default';
    },
    on_finish: function (data) {
        data.rating = parseInt(data.response + 1);
        document.documentElement.style.cursor = 'none';
        if (save_data_locally != "on"){
            saveData();
        }
    }
};
let feedback_2 = {
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    trial_duration: feedback2Duration,
    stimulus: function () {
        const choice_info = jsPsych.data.getLastTrialData().values()[0];
        let stim = '<div style="color: black; font-size: 16pt; border: 8px solid black; width: 400px; height: 400px; display: flex; justify-content: center; align-items: center;box-sizing: border-box;">You chose ' + parseInt(choice_info.response + 1) + '.' + '</div>';
        return stim;
    },
    prompt: jsPsych.timelineVariable('prompt_feedback_2'),
};
let break_time = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: break_text,
    choices: [" "],
    on_start: function() {
        $("#progressContainer").hide();
    },
    on_finish: function() {
        $("#progressContainer").show();
        document.documentElement.style.cursor = 'default';
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


// INITIAL INSTRUCTIONS
// practice_1: same or different
let same_or_different_instructions = {
    type: jsPsychInstructions,
    pages: same_or_different_instruction_pages(),
    show_clickable_nav: true,
    post_trial_gap: 1000,
    on_finish: function() {
        document.documentElement.style.cursor = 'default';
    }
};
if (jump_to_questionnaire != "on") {
    timeline.push(same_or_different_instructions);
}

practice = "practice_1";
for (blockNum = 1; blockNum <= 4; blockNum++){
    for (let i = 1; i <= primeNum; i++) {
        for (let j = 1; j <= testNum; j++) {
            let trial = generate_trial(practice, i, j, blockNum);
            trials_1.push(trial);
        }
    }
}
let practice_1_structure = {
    timeline: [iti, fixation, gap1, test_stage, feedback],
};
if (review_mode == "on") {
    practice_1_trials = [trials_1[0]];
} else {
    practice_1_trials = [trials_1[0], trials_1[31], trials_1[22], trials_1[17]];
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [practice_1_structure], 
        timeline_variables: practice_1_trials,
        randomize_order: false
    });
}

// practice_2: imagine in their original positions
let imagination_instructions = {
    type: jsPsychInstructions,
    pages: imagination_instruction_pages(),
    show_clickable_nav: true,
    post_trial_gap: 1000,
    on_finish: function() {
        document.documentElement.style.cursor = 'default';
    }
};
if (jump_to_questionnaire != "on") {
    timeline.push(imagination_instructions);
}

practice = "practice_2";
for (blockNum = 1; blockNum <= 4; blockNum++){
    for (let i = 1; i <= primeNum; i++) {
        for (let j = 1; j <= testNum; j++) {
            let trial = generate_trial(practice, i, j, blockNum);
            trials_2.push(trial);
        }
    }
}
let practice_2_structure = {
    timeline: [iti, fixation, gap1, image_stage, gap2, gap3, rating_stage, feedback_2],
};
if (review_mode == "on") {
    practice_2_trials = [trials_2[0]];
} else {
    practice_2_trials = [trials_2[6], trials_2[90], trials_2[42], trials_2[127]];
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [practice_2_structure], 
        timeline_variables: practice_2_trials,
        randomize_order: false
    });
}

// practice_3: combine the same/different task with the imagination task
let practice_instructions = {
    type: jsPsychInstructions,
    pages: practice_instruction_pages(),
    show_clickable_nav: true,
    post_trial_gap: 1000,
    on_start: function() {
        document.documentElement.style.cursor = 'default';
    },
};
if (jump_to_questionnaire != "on") {
    timeline.push(practice_instructions);
}

practice = "practice_3";
for (blockNum = 1; blockNum <= 4; blockNum++){
    for (let i = 1; i <= primeNum; i++) {
        for (let j = 1; j <= testNum; j++) {
            let trial = generate_trial(practice, i, j, blockNum);
            trials_3.push(trial);
        }
    }
}
let practice_3_structure = {
    timeline: [iti, fixation, gap1, image_stage, gap2, gap3, test_stage, feedback, rating_stage, feedback_2],
};
if (review_mode == "on") {
    practice_3_trials = [trials_3[0]];
} else {
    practice_3_trials = [trials_3[80], trials_3[107], trials_3[20], trials_3[37], trials_3[58], trials_3[88]];
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [practice_3_structure], 
        timeline_variables: practice_3_trials,
        randomize_order: false
    });
}


// make real trials
practice = "off";
for (blockNum = 1; blockNum <= 4; blockNum++){
    for (let r = 0; r < repeatTimes; r++){
        for (let i = 1; i <= primeNum; i++) {
            for (let j = 1; j <= testNum; j++) {
                let trial = generate_trial(practice, i, j, blockNum);
                trials.push(trial);
            }
        }
    }
}
const shuffleTrials = trials.sort(() => Math.random() - 0.5);
block1 = shuffleTrials.slice(0, shuffleTrials.length / 4);
block2 = shuffleTrials.slice(shuffleTrials.length / 4, shuffleTrials.length / 2);
block3 = shuffleTrials.slice(shuffleTrials.length / 2, shuffleTrials.length / 4 * 3);
block4 = shuffleTrials.slice(shuffleTrials.length / 4 * 3);


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
    timeline: [iti, fixation, gap1, image_stage, gap2, gap3, test_stage, feedback, rating_stage, feedback_2],
}; 
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [trial_structure], 
        timeline_variables: block1,
        randomize_order: false
    });
    timeline.push(break_time);
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [trial_structure], 
        timeline_variables: block2,
        randomize_order: false
    });
    timeline.push(break_time);
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [trial_structure], 
        timeline_variables: block3,
        randomize_order: false
    });
    timeline.push(break_time);
}
if (jump_to_questionnaire != "on") {
    timeline.push({
        timeline: [trial_structure], 
        timeline_variables: block4,
        randomize_order: false
    });
}


// Make a trial.
// trial_condition: 1 = no prime: triangle in the center; 2 = prime separate; 3 = prime occluded; 4 = prime complete
function generate_trial(practice, primeIndex, testIndex, blockNum) {
    let trial;
    let primeImage;
    let trialImage;
    let anchorImage;
    let correct_response;
    let correct_answer;
    let test_shape;
    let prime_shape;
    let responseDuration;
    let image_duration;
    let imagery_duration;
    let prompt_iti;
    let prompt_fixation;
    let prompt_gap1;
    let prompt_image_stage;
    let prompt_gap2;
    let prompt_gap3;
    let prompt_test_stage;
    let prompt_feedback;
    let prompt_rating_stage;
    let prompt_feedback_2;
    if (blockNum == 1){
        primeImage = 'image/' + primeIndex + '/no_prime_triangle_frame' + '.svg';
        anchorImage = 'image/' + primeIndex + '/anchor_big' + '.svg';
        imagery_duration = imageryDuration;
    } else if (blockNum == 2){
        primeImage = 'image/' + primeIndex + '/prime_sep_frame' + '.svg';
        anchorImage = 'image/' + primeIndex + '/anchor_big' + '.svg';
        imagery_duration = imageryDuration;
    } else if (blockNum == 3){
        primeImage = 'image/' + primeIndex + '/prime_occ_frame' + '.svg';
        anchorImage = 'image/' + primeIndex + '/anchor_small' + '.svg';
        imagery_duration = imageryDuration;
    } else if (blockNum == 4){
        primeImage = 'image/' + primeIndex + '/prime_complete_frame' + '.svg';
        anchorImage = 'image/' + primeIndex + '/anchor_small' + '.svg';
        imagery_duration = imageryDuration;
    }
    trialImage = 'image/' + primeIndex + '/test' + testIndex + '.svg';

    if (testIndex == 1 || testIndex == 2){ // same
        correct_response = keySame;
        correct_answer = "same";
        if (testIndex == 1){
            test_shape = "complete";
        } else if (testIndex == 2){
            test_shape = "notched";
        }
    } else { // different
        correct_response = keyDifferent;
        correct_answer = "different";
        if (testIndex == 3){
            test_shape = "complete";
        } else if (testIndex == 4){
            test_shape = "notched";
        }
    }
    if (primeIndex <= 4){
        prime_shape = "circle";
    } else {
        prime_shape = "square";
    }
    if (practice == "practice_1"){  // same/different practice
        image_duration = imageDuration;
        prompt_iti = promptKey;
        prompt_fixation = promptKey;
        prompt_gap1 = promptKey;
        prompt_image_stage = promptKey;
        prompt_gap2 = promptKey;
        prompt_test_stage = promptKey;
        prompt_feedback = promptKey;
        responseDuration = maxResponseTimePractice;
    } else if (practice == "practice_2"){ // imagery practice
        prompt_iti = promptPlaceholder;
        prompt_fixation = promptPlaceholder;
        prompt_gap1 = promptPlaceholder;
        prompt_image_stage = promptImage;
        prompt_gap2 = promptImagery;
        prompt_gap3 = promptImagery;
        prompt_test_stage = promptKey;
        prompt_feedback = promptKey;
        prompt_rating_stage = promptVivdness;
        prompt_feedback_2 = promptVivdness;
        responseDuration = maxResponseTime;
        image_duration = imageDurationPractice;
        imagery_duration = imageryDurationPractice;
    } else if (practice == "practice_3"){ // combine practice
        prompt_iti = promptPlaceholder;
        prompt_fixation = promptPlaceholder;
        prompt_gap1 = promptPlaceholder;
        prompt_image_stage = promptImage;
        prompt_gap2 = promptImagery;
        prompt_gap3 = promptImagery;
        prompt_test_stage = promptKey;
        prompt_feedback = promptKey
        prompt_rating_stage = promptVivdness;
        prompt_feedback_2 = promptVivdness;
        responseDuration = maxResponseTime;
        image_duration = imageDuration;
    } else {
        image_duration = imageDuration;
        responseDuration = maxResponseTime;
    }
    trial = {
        prime_image: primeImage,
        anchor_image: anchorImage,
        stimulus: trialImage,
        trial_duration: responseDuration, // same or different max response time
        prompt_iti: prompt_iti,
        prompt_fixation: prompt_fixation,
        prompt_gap1: prompt_gap1,
        prompt_image_stage: prompt_image_stage,
        prompt_gap2: prompt_gap2,
        prompt_gap3: prompt_gap3,
        prompt_test_stage: prompt_test_stage,
        prompt_feedback: prompt_feedback,
        prompt_rating_stage: prompt_rating_stage,
        prompt_feedback_2: prompt_feedback_2,
        image_duration: image_duration,
        imagery_duration: imagery_duration,
        data: {
            isPractice: practice,
            correct_response: correct_response,
            correct_answer: correct_answer,
            prime_type: primeIndex,
            prime_shape: prime_shape,
            test_type: testIndex,
            test_shape: test_shape,
            trial_condition: blockNum,
        },
    }; 
    return trial;
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

// questionaire
let questionaire = {
    type: jsPsychSurveyText,
    on_start: function() {
        document.documentElement.style.cursor = 'default';
    },
    preamble: "<br><br>Post-experiment questionnaire",
    questions: [
        {prompt: "1. Did you use any particular strategy when imagining the shapes?", name: "imagery_strategy", rows: 4, columns: 64, required: true},
        {prompt: "2. Did you use any particular strategy when doing the same/different task?", name: "strategy", rows: 4, columns: 64, required: true},
        {prompt: "3. Do you feel you were able to follow the task instructions correctly?", name: "instructions", rows: 4, columns: 64, required: true}, 
        {prompt: "4. Do you have any other comments for us about the experiment or how you felt doing it?", rows: 4, columns: 64, name: "comments", required: true},
    ], 
    on_finish: function(data) {
        data.responses = JSON.stringify(data.response);
        jsPsych.data.get().addToLast({
            response: data.responses
        });
        if (save_data_locally != "on"){
            saveData();
        }
    }
};
timeline.push(questionaire);

// Demographics
let demographics = {
    type: jsPsychSurveyHtmlForm,
    html: demographics_html,
    button_label: 'Next',
    on_finish: function(data) {
        data.responses = JSON.stringify(data.response);
        jsPsych.data.get().addToLast({
            response: data.responses
        });
        if (save_data_locally != "on"){
            saveData();
        }
    },
};
timeline.push(demographics);

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
        done(); // Ensure the next trial starts after data is saved
    };

    // Get data from the last trial only and send it
    let lastTrialData = jsPsych.data.getLastTrialData().json();
    xhr.send(lastTrialData); // Send only the last trial's data
}
  
jsPsych.run(timeline);