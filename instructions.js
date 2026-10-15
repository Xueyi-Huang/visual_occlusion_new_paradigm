const wellcome_text = '<p>This experiment runs in fullscreen. Click Begin to continue.</p>';
const block_text = 'This study requires a display running at 60 Hz or faster. Please refresh the page or use another display.';
const good_frame_text = '<p>Display check complete. Click Next to read the instructions.</p>';
let response_instructions, rating_instructions, imagery_instructions, line_practice_pages, imagery_practice_pages, full_practice_pages;

// Build color-dependent text after participant assignment in experiment.js.
function instructionImage(source, description) {
    return `<img src="${source}" alt="${description}" style="width:300px;max-width:100%;height:auto;display:block;margin:16px auto;">`;
}

function instructionPage(content) {
    return `<div class="instructions left-aligned">${content}</div>`;
}

function practiceStartText() {
    return `<p>Let's do a few practice trials before we continue.</p>
        <p>Please place two fingers from your left hand on <strong>${keySame}</strong> and <strong>${keyDifferent}</strong>, and use your left thumb to press Space when a warning asks you to continue. Keep your right hand on your mouse or trackpad.</p>
        <p>You won't be able to return to these instructions once you've started practice, so <strong>go back now if you want to reread anything</strong>.</p>
        <p>If you are ready, click Next to start practice.</p>`;
}

function fixationInstruction() {
    return instructionPage(`<p>At the beginning of each trial, a cross will appear in the center of the screen. Please <strong>keep your gaze at the center throughout the trial</strong>.</p>
        <div class="task-panel fixation-text" style="width:240px;height:240px;margin:16px auto;">+</div>`);
}

function initializeTaskInstructions() {
    response_instructions = `<p>Your task is to determine <strong>whether the two red lines have the same or different lengths</strong>.</p>
        <p>After the lines disappear and the question appears, press <strong>${keySame}</strong> if they are the same length, or <strong>${keyDifferent}</strong> if they are different lengths.</p>`;
    rating_instructions = `<p>Then, you will be asked to rate how vivid your mental image was during that trial. Use your mouse or trackpad to click the button with your rating.</p>
        <p><strong>1 = Not vivid at all<br>2 = Slightly vivid<br>3 = Moderately vivid<br>4 = Very vivid<br>5 = Perfectly vivid</strong></p>
        <p>Rate each trial <strong>based on your experience during that specific one</strong>, independently of your same/different answer or how you've rated other trials. Choose 1 if you could not form an image, and 5 if it was as vivid as actually seeing the bar.</p>`;
    imagery_instructions = `<p>Your task is to <strong>imagine the ${occluderColor} bar as vividly as you can</strong>.</p>
        <p>${imageryDescription(firstBlockCondition)}</p>
        <p>The picture below illustrates what you should imagine. The bar itself will not appear during the trials. Please keep the two ${squareColor} squares in their original positions.</p>
        ${instructionImage(occluderIllustration(practiceImageryPosition), imageryDescription(firstBlockCondition))}`;
    line_practice_pages = [
        instructionPage(`<p>${skip_vviq === 'off' ? 'Thanks for the help. And welcome to the experiment part!' : 'Welcome! Thanks for helping us better understand how vision and imagination work.'}</p>
            <p>There are two types of tasks in this study. Your first task is to determine <strong>whether two lines have the same or different lengths as quickly and accurately as you can</strong>.</p>`),
        fixationInstruction(),
        instructionPage(`${response_instructions}<p>In this example, the lines are the same length. You'd press <strong>${keySame}</strong>.</p>${instructionImage(gridStimulus([shortLine, shortLine]), 'Two equally short red lines')}`),
        instructionPage(`<p>The two lines in this example have different lengths. You'd press <strong>${keyDifferent}</strong>.</p>${instructionImage(gridStimulus([shortLine, longLine]), 'Short left line and long right line')}`),
    ];
    imagery_practice_pages = [
        instructionPage(`<p>Well done!</p><p>Next, you will practice <strong>imagining a bar as vividly as you can</strong> and rating your mental image.</p>`),
        fixationInstruction(),
        instructionPage(imagery_instructions),
        instructionPage(`<p>Please imagine the bar <strong>with your eyes open</strong>, and keep it in your mind as vividly as possible <strong>until the rating screen appears</strong>.</p><p>The two ${squareColor} squares stay on screen; only the bar is imagined.</p>`),
        instructionPage(rating_instructions),
        instructionPage(`<p>Let's practice imagining and rating the bar. There are <strong>no line judgments</strong> in this round.</p><p>Please really try your best to imagine the bar as vividly as possible on each trial.</p><p>Go back now if you want to reread anything. If you are ready, click Next to start practice.</p>`),
    ];
    full_practice_pages = [
        instructionPage(`<p>Well done!</p><p>Now, let's combine the imagination task with the same/different task. Click Next to read the complete procedure.</p>`),
        fixationInstruction(),
        instructionPage(imagery_instructions),
        instructionPage(`<p>Keep imagining the bar <strong>as vividly as possible while the two red lines appear</strong>. Compare the lengths of the visible lines.</p>${response_instructions}${instructionImage(gridStimulus([shortLine, shortLine]), 'Example of the visible red lines')}`),
        instructionPage(rating_instructions),
        instructionPage(`<p>Please really try your best to imagine the bar and keep it in mind while viewing the lines. We also need you to respond <strong>as quickly and accurately as possible</strong> once the question appears.</p>${practiceStartText()}`),
    ];
}

const thank_you_text = '<p>Thank you for completing the task! A few brief questionnaires are all that remain.</p><p>Press Space to continue.</p>';
function practiceBufferText(practiceType) {
    const compareLines = practiceType !== 'practice_imagery';
    const imagineBar = practiceType !== 'practice_lines';
    return instructionPage(`<p>Let's do a few practice trials before we continue.</p>
        <p>Please try to <strong>stay focused</strong>. Find a comfortable position to look at the screen and keep your gaze at the center.</p>
        ${imagineBar ? '<p>Please really try your best to imagine the bar <strong>as vividly as possible</strong>, and keep it in mind until the next screen appears.</p>' : ''}
        ${compareLines ? `<p>We need you to respond <strong>as quickly and accurately as possible</strong> once the question appears. Place two fingers from your left hand on <strong>${keySame}</strong> and <strong>${keyDifferent}</strong>, and use your left thumb to press Space when needed.</p>` : ''}
        <p>Keep your right hand on your mouse or trackpad${imagineBar ? ' to click your rating' : ''}.</p>
        <p>Press Space when you are ready to start. Good luck!</p>`);
}
const buffer_text = '<p>Thank you for participating! Click Submit to finish and continue to the debriefing page.</p>';

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
    </fieldset>
    <br>
    `;

function toggleSpecifyInput() {
    var select = document.getElementById("d6_visDefi");
    var specifyContainer = document.getElementById("specifyContainer");
    if (select.value === "Yes") {
        specifyContainer.style.display = "inline"; // Show input next to the dropdown
    } else {
        specifyContainer.style.display = "none"; // Hide input if not "Yes"
        document.getElementById("d6_specify").value = ""; // Clear the input when hidden
    }
}

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

// Block-specific imagery instructions and examples.
function imageryDescription(blockNumber) {
    const descriptions = {
        1: `Picture a ${occluderColor} bar standing upright between the two ${squareColor} squares. It covers the middle three grid squares.`,
        2: `Picture a ${occluderColor} bar lying across the top of the two ${squareColor} squares. It covers three grid squares just above them.`,
        3: `Picture a ${occluderColor} bar lying across the whole middle row, behind the two ${squareColor} squares. The squares hide the parts of the bar behind them.`,
    };
    return descriptions[blockNumber];
}

function blockInstructionPages(blockNumber, blockPosition = blockNumber) {
    const position = {1: 'middle', 2: 'top', 3: 'behind'}[blockNumber];
    return [
        instructionPage(`<p>Welcome to block ${blockPosition}!</p>
            <p>In this block, you'll continue with the <strong>same/different task combined with the imagination task</strong>. Click Next to see what you should imagine.</p>`),
        instructionPage(`<p>After the cross, the grid and two ${squareColor} squares will appear. Your task is to <strong>imagine the ${occluderColor} bar as vividly as you can</strong>.</p>
            <p>${imageryDescription(blockNumber)}</p>
            <p>The picture below illustrates what you should imagine. The bar itself will not appear during the trials. Please keep the two ${squareColor} squares in their original positions.</p>
            ${instructionImage(occluderIllustration(position), imageryDescription(blockNumber))}`),
        instructionPage(`<p>Imagine the bar <strong>with your eyes open</strong>, and keep imagining it as vividly as possible while the two red lines appear.</p>
            ${response_instructions}
            ${instructionImage(gridStimulus([shortLine, shortLine]), 'Example of the visible red lines')}`),
        instructionPage(rating_instructions),
        instructionPage(`<p>Please really try your best to imagine the bar and keep it in mind while viewing the lines. Respond <strong>as quickly and accurately as possible</strong> once the question appears.</p>
            <p>You can take a short break here.</p>
            ${blockPosition > 1 ? `<p>Let's first practice with this bar position.</p>${practiceStartText()}` : '<p>Go back now if you want to reread anything. If you are ready, click Next to start the main trials.</p>'}`),
    ];
}
