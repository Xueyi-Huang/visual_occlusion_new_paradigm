const wellcome_text = '<p>This experiment runs in fullscreen. Please do not exit fullscreen during the experiment unless you wish to stop.</p>' +
'<p>Please wait for a few seconds after you click the button. </p></div>';
const block_text = 'This study requires a display running at 60 Hz or faster. Please refresh the page or use another display.';
const good_frame_text = '<p>Display check complete. Click "Next" to read the instructions.</p>';
let response_instructions, full_practice_pages;

// Build color-dependent text after participant assignment in experiment.js.
function instructionImage(source, description) {
    return `<img src="${source}" alt="${description}" style="width:${Math.round(taskFrameSize * 0.8)}px;max-width:100%;height:auto;display:block;margin:16px auto;">`;
}

function instructionPage(content) {
    return `<div class="instructions left-aligned">${content}</div>`;
}

function practiceStartText() {
    return `<p>Let's do a few practice trials before we continue.</p>
        <p>You won't be able to return to these instructions once you've started practice, so <strong>go back now if you want to reread anything</strong>.</p>
        <p>If you are ready, click "Next" to start practice.</p>`;
}

function fixationInstruction() {
    const fixationFontSize = document.documentElement.style.getPropertyValue('--fixation-font-size');
    const illustration = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${taskFrameSize}" height="${taskFrameSize}" viewBox="0 0 ${taskFrameSize} ${taskFrameSize}"><rect width="${taskFrameSize}" height="${taskFrameSize}" fill="lightgray"/><text x="${taskFrameSize / 2}" y="${taskFrameSize / 2}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${fixationFontSize}" fill="black">+</text>${taskFrameOutline()}</svg>`);
    return instructionPage(`<p>At the beginning of each trial, a cross will appear in the center of the screen. Please <strong>keep your gaze at the center throughout the trial</strong> even after the cross disappears.</p>
        ${instructionImage(illustration, 'Fixation cross centered in the box')}`);
}

const thank_you_text = '<p>Thank you for completing the task! A few brief questionnaires are all that remain.</p><p>Press "Space" to continue.</p>';
const buffer_text = '<p>Thank you for participating! Please allow 3 seconds for the data to be downloaded, and then click "Submit" to proceed to the debriefing page.</p>';

// empty box gender
const demographics_html = `
    <br><br>
    <div>
        <p><strong>Please tell us a bit more about yourself!</strong></p>
        <br/>
    </div>
    <fieldset>
        <br/>
        <p><label for="d1_age">1. How old are you?</label>
            <select id="d1_age" name="d1_age">
                <option value=""></option>
                ${Array.from({ length: 100 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
            </select>
            <br/><br />
        </p>
        <p>
            <label for="d2_gender">2. What is your gender?</label>
            <input type="text" id="d2_gender" name="d2_gender" placeholder="" />
            <br /><br />
        </p>
        <p>
            <label for="d3_english">3. Are you a competent English speaker?</label>
            <select id="d3_english" name="d3_english">
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
            <br /><br />
        </p>
        <p>
            <label for="d4_glasses">4. Do you need glasses or contact lenses to see clearly?</label>
            <select id="d4_glasses" name="d4_glasses">
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
            <br /><br />
        </p>
        <p>
            <label for="d5_wearGlasses">5. If you answered "yes" to the previous question, were you wearing your glasses or contact lenses during the experiment?</label>
            <select id="d5_wearGlasses" name="d5_wearGlasses">
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="No">N/A (I don't need glasses.)</option>
            </select>
            <br /><br />
        </p>
        <p>
            <label for="d6_visDefi">6. Do you have any other vision impairments or deficiencies?</label>
            <select id="d6_visDefi" name="d6_visDefi" onchange="toggleSpecifyInput()">
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
            <span id="specifyContainer" style="display:none; margin-left: 10px;">
                <input type="text" id="d6_specify" name="d6_specify" placeholder="Please specify">
            </span>
            <br /><br />
        </p>
        <p>
        <label for="d7_handedness">7. Are you right or left handed?</label>
        <select id="d7_handedness" name="d7_handedness">
            <option value=""></option>
            <option value="Right-handed">Right-handed</option>
            <option value="Left-handed">Left-handed</option>
            <option value="Ambidextrous">Ambidextrous</option>
            </select>
            <br /><br />
        </p>
        <!-- Retained for the imagery version:
        <p>
        <label for="d8_imageryability">8. How would you describe your mental imagery in general?</label>
        <select id="d8_imageryability" name="d8_imageryability">
            <option value=""></option>
            <option value="1">I have no imagery at all.</option>
            <option value="2">Vague and dim.</option>
            <option value="3">Moderately clear and vivid.</option>
            <option value="4">Clear and reasonably vivid.</option>
            <option value="5">As vivid as normal vision.</option>
            </select>
            <br /><br />
        </p>
        -->
    </fieldset>
    <br>
    `;

function toggleSpecifyInput() {
    const select = document.getElementById("d6_visDefi");
    const specifyContainer = document.getElementById("specifyContainer");
    if (select.value === "Yes") {
        specifyContainer.style.display = "inline"; // Show input next to the dropdown
    } else {
        specifyContainer.style.display = "none"; // Hide input if not "Yes"
        document.getElementById("d6_specify").value = ""; // Clear the input when hidden
    }
}

const screen_calibration_text = `<div class="instructions left-aligned">
    <h2>Match your screen to a card</h2>
    <p><strong>We do this to keep the visual display the same physical size for all participants.</strong></p>
    <p>Use a <strong>standard bank card</strong> (85.6 × 53.98 mm, or 3.375 × 2.125 in). Hold it against your screen and move the slider until the rectangle's <strong>outside edges match the card</strong>.</p>
    <p>After matching, put the card away and sit <strong>at least ${viewingDistanceCm} cm</strong> (<strong>${(viewingDistanceCm / 2.54).toFixed(1)} in</strong>) away from the screen. <strong>Keep your viewing distance consistent throughout the task, and do not change browser zoom or switch screens</strong> so that the display appears a consistent size for you across the study.</p>
    <br>
    <div id="calibration-card" style="width:320px;aspect-ratio:85.6 / 53.98;border:2px solid black;box-sizing:border-box;background:white;margin:24px auto;"></div>
    <input id="card-size-slider" type="range" min="120" max="600" step="1" value="320" style="display:block; width:60%; margin:20px auto;">
    <p><label><input id="calibration-distance" type="checkbox"> <strong>I've matched the card and will sit at least ${viewingDistanceCm} cm (${((viewingDistanceCm / 2.54).toFixed(1))} in) away.</strong></label></p>
    <br>
    <button id="calibration-continue" class="jspsych-btn" disabled>Continue</button>
    <p id="calibration-message" role="status" aria-live="polite"></p>
</div>`;

function perception_initial_instruction_pages(numBlocks) {
    return [
        instructionPage(`<p>While reading the instructions, you can return to previous pages using the <strong>"Previous"</strong> button below.</p>
            <p><strong>Do not use your browser's "Back" button</strong> unless you wish to stop participating.</p>`),
        instructionPage(`<p>Welcome! Thanks for helping us better understand how people's vision works.</p>
            <p>Your task is to judge <strong>whether two lines have the same or different lengths</strong>.</p>
            <p>First, you'll read the instructions and complete some practice. Then you'll complete ${numBlocks} blocks, followed by a few questions about the study.</p>
            <p>You can take a short break between blocks, while the instructions are on screen.</p>
            <p>Click "Next" to learn the task.</p>`),
    ];
}

// Active perception instructions: the bar is physically visible, with no imagery rating.
function perceptionDescription(conditionId) {
    const {occlusion, orientation} = perceptionConditions[conditionId];
    const squares = orientation === 'vertical' ? 'on the left and right' : 'at the top and bottom';
    const bar = orientation === 'vertical' ? 'upright' : 'sideways';
    return `The two ${squareColor} squares are ${squares}. ` + (occlusion === 'occluded'
        ? `A ${occluderColor} bar lies ${bar} between them, covering the middle three grid cells.`
        : '');
}

function perceptionSequenceDescription(conditionId) {
    return perceptionConditions[conditionId].occlusion === 'occluded'
        ? `Then, a ${occluderColor} bar appears, covering the middle three grid cells between the two squares.`
        : 'The two squares stay on screen, then the green lines appear inside them.';
}

function perceptionExample(conditionId, lengths = null) {
    return instructionImage(perceptionStimulus(conditionId, lengths), 'The display in this block');
}

function initializePerceptionInstructions() {
    response_instructions = `<p>Finally, two green lines will appear in the two squares.</p><p>Your task is to judge <strong>whether they have the same or different lengths</strong>. Press <strong>"Z"</strong> for ${keySame === 'Z' ? 'the same' : 'different'} lengths, or <strong>"M"</strong> for ${keySame === 'M' ? 'the same' : 'different'} lengths.</p>`;
    full_practice_pages = [
        fixationInstruction(),
        instructionPage(`<p>Next, you'll see a grid with two ${squareColor} squares.</p>${instructionImage(perceptionStimulus(firstBlockCondition, null, false), 'The two squares')}`),
        ...(perceptionConditions[firstBlockCondition].occlusion === 'occluded' ? [
            instructionPage(`<p>${perceptionSequenceDescription(firstBlockCondition)}</p>${perceptionExample(firstBlockCondition)}`),
        ] : []),
        instructionPage(`${response_instructions}<p>In this example, the lines have the <strong>same length</strong>, so you'll need to press <strong>"${keySame}"</strong>.</p>${perceptionExample(firstBlockCondition, [shortLine, shortLine])}`),
        instructionPage(`<p>These lines in this example have <strong>different lengths</strong>, so you'll need to press <strong>"${keyDifferent}"</strong>.</p>${perceptionExample(firstBlockCondition, [shortLine, longLine])}`),
        instructionPage(`${practiceStartText()}`),
    ];
}

function blockInstructionPages(conditionId, blockNum) {
    const pages = [];
    if (blockNum > 1) {
        pages.push(instructionPage(`<p>Welcome to ${blockNum === blockOrder.length ? 'the final block' : `block ${blockNum}`}!</p>
            <p>The display will be slightly different from the previous block.</p>${perceptionExample(conditionId, [shortLine, longLine])}
            <p>Each trial starts with a cross, followed by two ${squareColor} squares ${perceptionConditions[conditionId].orientation === 'vertical' ? 'on the left and right' : 'at the top and bottom'}.
            ${perceptionConditions[conditionId].occlusion === 'occluded'
                ? `Next, a ${occluderColor} bar appears between the squares, followed by the green lines.`
                : 'Then, two green lines briefly appear inside the squares. '}
            Your task is to <strong>judge whether the lines have the same or different lengths</strong>.</p>`));
    }
    pages.push(instructionPage(`${blockNum === 1
        ? '<p><strong>Well done!</strong> You are ready for the real trials.</p>'
        : ''}
        <p>Reminder: Press <strong>"Z"</strong> for ${keySame === 'Z' ? 'the same' : 'different'} lengths, or <strong>"M"</strong> for ${keySame === 'M' ? 'the same' : 'different'} lengths.</p>
        ${blockNum === 1 ? `<p>The lines appear for less time than in practice, so the task may be difficult. There's no need to restart the study or return your submission even if you feel you are not doing well, <strong>but please try your best to judge the line lengths accurately</strong>. Main trials do not show correct/incorrect feedback.</p>`
            : '<p><strong>Please try your best to judge the line lengths accurately</strong>.</p>'}
        <p>Please sit back and stay <strong>at least ${viewingDistanceCm} cm (${(viewingDistanceCm / 2.54).toFixed(1)} inches)</strong> away from the screen, keeping your viewing distance consistent throughout the study.</p>
        <p>Click "Next" when you're ready to start the real trials. Good luck!</p>`));
    return pages;
}

/*
RETAINED IMAGERY VERSION — inactive reference code.
These fragments originally appeared at different points in the timeline.
Restore each section to its appropriate scope when rebuilding the imagery task.

// Additional variables for the imagery instructions.
let rating_instructions, line_practice_pages, imagery_practice_pages;

// Original imagery practice instructions retained for future use.
function initializeTaskInstructions() {
    response_instructions = `<p>Your task is to determine <strong>whether the two green lines have the same or different lengths</strong>.</p>
        <p>You will need to press <strong>"${keySame}"</strong> if they are the same length, or <strong>"${keyDifferent}"</strong> if they are different lengths.</p>`;
    rating_instructions = `<p>Then, you will be asked to <strong>rate how vivid your mental image was</strong>.</p>
        <p>Rate each trial <strong>based on your experience during that specific one</strong>, independently of how you've rated other trials. Choose 1 if you could not form an image, and 5 if it was as vivid as actually seeing the bar.</p>`;
    line_practice_pages = [
        instructionPage(`<p>${skip_vviq === 'off' ? 'Thanks for the help. And welcome to the experiment part!' : 'Welcome! Thanks for helping us better understand how vision and imagination work.'}</p>
            <p>There are two types of tasks in this study. Your first task is to determine <strong>whether two lines have the same or different lengths accurately</strong>.</p>`),
        fixationInstruction(),
        instructionPage(`${response_instructions}<p>In this example, the lines are the same length. You'd press <strong>"${keySame}"</strong>.</p>${instructionImage(gridStimulus([shortLine, shortLine]), 'Two equally short green lines')}`),
        instructionPage(`<p>The two lines in this example have different lengths. You'd press <strong>"${keyDifferent}"</strong>.</p>${instructionImage(gridStimulus([shortLine, longLine]), 'Short left line and long right line')}`),
        instructionPage(practiceStartText()),
    ];
    imagery_practice_pages = [
        instructionPage(`<p>Well done!</p><p>Next, you will practice <strong>imagining a bar as vividly as you can</strong> and rating your mental image.</p>`),
        fixationInstruction(),
        ...imageryInstructionPages(firstBlockCondition),
        instructionPage(rating_instructions),
        instructionPage(`<p>Let's practice imagining and rating the bar.</p><p>Please really try your best to <strong>imagine the bar as vividly as possible until the next screen appears</strong>.</p><p>Keep your right hand on your mouse or trackpad to click your rating.</p><p>You won't be able to return to these instructions once you've started practice, so <strong>go back now if you want to reread anything</strong>.</p><p>If you are ready, click "Next" to start practice.</p>`),
    ];
    full_practice_pages = [
        instructionPage(`<p>Well done!</p><p>Now, let's <strong>combine the imagination task with the same/different task</strong>. Click "Next" to read the complete procedure.</p>`),
        fixationInstruction(),
        ...imageryInstructionPages(firstBlockCondition),
        instructionPage(`<p>Keep imagining the bar <strong>as vividly as possible until the two green lines appear</strong>. Compare the lengths of the visible lines.</p>${response_instructions}${instructionImage(gridStimulus([shortLine, shortLine]), 'Example of the visible green lines')}`),
        instructionPage(rating_instructions),
        instructionPage(`<p>Please really try your best to <strong>imagine the bar and keep it in mind</strong>, and focus on judging the line lengths <strong>accurately</strong>.</p>${practiceStartText()}`),
    ];
}

// Original imagery/VVIQ introduction retained for future use.
function initial_instruction_pages() {
    return [
        "<div class='instructions left-aligned'>" +
            "<p>While reading the instructions that follow, you can go back to " +
            "previous pages using the \"Previous\" button below. " +
            "<strong>Do not click the \"back\" button in your browser</strong> at any time " +
            "during the experiment, including during the instructions, unless you no longer " +
            "wish to participate in the experiment.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Welcome! Thanks for helping us better understand how people's vision and imagination work. <p>" +
            "<p>First, you will complete a questionnaire on visual mental imagery before heading to the experiment part.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p><strong>Visual imagery refers to the ability to visualize, that is, the ability to form mental pictures, or to \"see in the mind's eye\".</strong> Marked individual differences are found in the strength and clarity of reported visual imagery and these differences are of considerable psychological interest.</p>" +

            "<p><strong>The aim of this test is to determine the vividness of your visual imagery.</strong> The items of the test will possibly bring certain images to your mind. You are asked to rate the vividness of each image by reference to the five-point scale given below. For example, if your image is \"vague and dim\", then give it a rating of 2.</p><br>" +

            "<p><strong>Rating Scale</strong></p>" +
            "<p>1: No image at all, you only \"know\" that you are thinking of the object.<br>2: Vague and dim.<br>3: Moderately clear and vivid.<br>4: Clear and reasonably vivid.<br>5: Perfectly clear and as vivid as normal vision.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Before you turn to the items, familiarize yourself with the different categories on the rating scale. Throughout the test, refer to the rating scale when judging the vividness of each image. <strong>Try to do each item separately, independent of how you may have done other items.</strong></p>" +

            "<p>You won't be able to return to these instructions once you've started the questionnaire, so <strong>go back now if you want to reread anything</strong>.</p>" +

            "<p>If you are ready, click \"Next\" to start.</p>" +
        "</div>",
    ];
};

// Original imagery block instructions retained for future use.
// Block-specific imagery instructions and examples.
function imageryDescription(conditionId) {
    const descriptions = {
        1: `You'll need to <strong>imagine a ${occluderColor} bar standing upright between the two ${squareColor} squares</strong>. It covers the <strong>middle three grid squares</strong>.`,
        2: `You'll need to <strong>imagine a ${occluderColor} bar lying across the top of the two ${squareColor} squares</strong>. It covers the <strong> three grid squares</strong> just above them.`,
        3: `You'll need to <strong>imagine a ${occluderColor} bar lying across the whole middle row</strong>. The bar is <strong>behind the ${squareColor} squares</strong>.`,
    };
    return descriptions[conditionId];
}

function afterBlockPracticeText(conditionId) {
    const position = conditionPositions[conditionId];
    return instructionPage(`<p><strong>Well done!</strong> You've finished practice for this block. Your tasks for the real trials are the same as those in the practice. Just a refresher:</p>
        <p>${imageryDescription(conditionId)}</p>
        ${instructionImage(occluderIllustration(position), imageryDescription(conditionId))}
        <p>Keep imagining the bar <strong>as vividly as possible</strong> until the green lines appear.</p>
        <p>Also, focus on judging the line lengths <strong>accurately</strong>. However, you won't be told whether your answers are correct.</p>
        <p>Press "Space" when you're ready to start.</p>`);
}

function imageryInstructionPages(conditionId) {
    const position = conditionPositions[conditionId];
    return [
        instructionPage(`
            <p>Then, you'll see the grid with two ${squareColor} squares on the screen.</p>
            ${instructionImage(gridStimulus(), `Gray grid with two ${squareColor} squares and no bar`)}`),
        instructionPage(`<p>${imageryDescription(conditionId)}</p>
            <p>This picture shows <strong>what to imagine in your mind</strong>. Keep your eyes open and imagine the ${occluderColor} bar <strong>as vividly as possible until the next screen</strong>.</p>
            ${instructionImage(occluderIllustration(position), imageryDescription(conditionId))}
`),
    ];
}

function blockInstructionPages(conditionId, blockNum) {
    if (blockNum === 1) {
        const position = conditionPositions[conditionId];
        return [instructionPage(`<p><strong>Well done!</strong> You've finished practice. Let's start the first block. Your tasks for the real trials are the same as those in the practice.</p>
            <p>${imageryDescription(conditionId)}</p>
            ${instructionImage(occluderIllustration(position), imageryDescription(conditionId))}
            <p>Keep imagining the bar <strong>as vividly as possible</strong> until the green lines appear.</p>
            <p>Focus on judging the line lengths <strong>accurately</strong>. However, you won't be told whether your answers are correct.</p>
            <p>Click "Next" when you're ready. Good luck!</p>`)];
    }
    const totalBlocks = Math.max(1, maxBlockNum || 3);
    const welcomeText = blockNum === totalBlocks
        ? '<p>Welcome to the final block!</p>'
        : `<p>Welcome to block ${blockNum}!</p>`;
    return [
        instructionPage(`${welcomeText}
            <p>In this block, you'll continue with the <strong>imagination task combined with the same/different task</strong>. Click "Next" to see what you should imagine.</p>`),
        ...imageryInstructionPages(conditionId),
        instructionPage(`<p>Imagine the bar <strong>with your eyes open</strong>, and keep imagining it <strong>as vividly as possible until the two green lines appear</strong>.</p>
            ${response_instructions}
            ${instructionImage(gridStimulus([shortLine, shortLine]), 'Example of the visible green lines')}`),
        instructionPage(rating_instructions),
        instructionPage(`<p>Please really try your best to <strong>imagine the bar and keep it in mind</strong>, and focus on judging the line lengths <strong>accurately</strong>.</p><p>Go back now if you want to reread anything. If you are ready, click "Next" to start the main trials.</p>`),
    ];
}
*/
