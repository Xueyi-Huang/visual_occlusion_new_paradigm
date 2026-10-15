const wellcome_text = '<p>This experiment runs in fullscreen. Click Begin to continue.</p>';
const block_text = 'This study requires a display running at 60 Hz or faster. Please refresh the page or use another display.';
const good_frame_text = '<p>Display check complete. Click Next to read the instructions.</p>';
let response_instructions, imagery_instructions, line_practice_pages, imagery_practice_pages, full_practice_pages;

// Build color-dependent text after participant assignment in experiment.js.
function initializeTaskInstructions() {
    response_instructions = `
        <p>Keep looking at the center of the box. Two vertical red lines will appear, one in each ${squareColor} square. Compare their visible lengths.</p>
        <p>Wait until the question “Same or different length?” appears, then press <strong>${keySame}</strong> for the same length or <strong>${keyDifferent}</strong> for different lengths.</p>
        <p>Respond as quickly and accurately as you can, within ${maxResponseTime / 1000} seconds of the question appearing. Do not guess before seeing the lines.</p>
        <p>Green feedback means correct; red feedback means incorrect. Responses within ${minResponseTime} ms of the question trigger a warning, as do missed responses. Press Space to continue after a warning.</p>`;
    imagery_instructions = `
        <p>${imageryDescription(firstBlockCondition)} The bar is a mental image: it will not be drawn on the screen.</p>
        <p>Form the image while the cue is shown and keep imagining it while you view the red lines. Judge only the lengths of the two visible red lines.</p>
        <p>After your response and feedback, use the mouse to rate how vivid your imagined occluder was: 1 = not vivid at all, 5 = perfectly vivid. Rate your mental image, rather than your confidence in the line judgment.</p>`;
    line_practice_pages = [
        `<div class="instructions left-aligned">
        <h2>Welcome to the experiment</h2>
        <p>${skip_vviq === 'off' ? 'Thank you for completing the visual imagery questionnaire! Now we will move on to the experiment.' : 'Thank you for taking part! We will now begin the experiment.'}</p>
        <p>There are two tasks in this study: judging whether two red lines have the same or different lengths, and imagining a bar in the instructed position. The main task has three blocks with different bar positions.</p>
        <p>You will practice these step by step. First, you will practice comparing the lines. In the second round, you will practice imagining the occluder and rating its vividness. In the third round, you will combine imagery, line judgments, and vividness ratings.</p>
        <p>Click Next to read the instructions for the first practice round.</p>
        </div>`,
        `<div class="instructions left-aligned"><h2>Practice 1: Compare the lines</h2>
        <p>First, you will practice judging line lengths. There is no imagery task or vividness rating in this round. The lines remain visible for ${linesDurationPractice / 1000} seconds to help you learn the task. You have ${maxResponseTimePractice / 1000} seconds to respond after the question appears.</p>
        ${response_instructions}
        <p>You will complete ${review_mode === 'on' ? '1 practice trial' : `${linePairs.length} practice trials`}. Click Next when you are ready.</p></div>`,
    ];
    imagery_practice_pages = [
        `<div class="instructions left-aligned"><h2>The imagined occluder</h2>
        <img src="${occluderIllustration(practiceImageryPosition)}" alt="${imageryDescription(firstBlockCondition)}" style="display:block;width:300px;max-width:100%;margin:16px auto;">
        <p>This illustration shows the ${occluderColor} occluder you should imagine with the ${squareColor} squares. During the trials, this rectangle will not be displayed: create it in your mind.</p></div>`,
        `<div class="instructions left-aligned"><h2>Practice 2: Imagine and rate</h2>
        <p>${imageryDescription(firstBlockCondition)}</p>
        <p>Form the mental image during the ${imageryDurationPractice / 1000}-second imagery cue. Then use the mouse to rate its vividness: 1 = not vivid at all, 5 = perfectly vivid. Rate your actual experience; there are no correct or incorrect ratings.</p>
        <p>No red lines or same/different questions appear in this round. This imagery condition matches your first main-task block.</p>
        <p>You will complete ${review_mode === 'on' ? '1 practice trial' : `${linePairs.length} practice trials`}. Click Next when ready.</p></div>`,
    ];
    full_practice_pages = [
        `<div class="instructions left-aligned"><h2>Practice 3: The full task</h2>
        <p>Now combine the two tasks, using the same bar position as the previous round and your first main-task block.</p>${imagery_instructions}
        <p>You have ${imageryDurationPractice / 1000} seconds to form the image. Keep imagining it while the red lines appear for ${linesDuration / 1000} seconds. When the question appears, press ${keySame} for same or ${keyDifferent} for different within ${maxResponseTime / 1000} seconds. After feedback, rate your imagery vividness.</p>
        <p>You will complete ${review_mode === 'on' ? '1 practice trial' : `${linePairs.length} practice trials`}. Click Next when ready.</p></div>`,
    ];

}

const thank_you_text = '<p>Thank you for completing the task! A few brief questionnaires are all that remain.</p><p>Press Space to continue.</p>';
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
        1: `Imagine a vertical ${occluderColor} bar over the middle three cells of the center column, between the two ${squareColor} squares.`,
        2: `Imagine a horizontal ${occluderColor} bar covering three cells across the row immediately above the two ${squareColor} squares. Use this TOP position on every trial.`,
        3: `Imagine a horizontal ${occluderColor} bar spanning the entire middle row, behind the two ${squareColor} squares. The squares are in front of the bar and hide those parts of it.`,
    };
    return descriptions[blockNumber];
}

function blockInstructionPages(blockNumber, blockPosition = blockNumber) {
    const positions = blockNumber === 2 ? ['top'] : [blockNumber === 1 ? 'middle' : 'behind'];
    return [`<div class="instructions left-aligned">
        <h2>Block ${blockPosition} of 3</h2>
        <p>This block contains ${review_mode === 'on' ? 2 : linePairs.length * repeatTimes} trials.</p>
        <p>${blockPosition > 1 ? 'You may take a break here. The imagined bar changes in the next block.' : 'Practice is complete. You will now complete three blocks with different imagined bar positions.'}</p>
        <p>${imageryDescription(blockNumber)}</p>
        <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;">${positions.map(position => `<figure style="margin:0;text-align:center;"><img src="${occluderIllustration(position)}" alt="Imagined bar: ${position}" style="width:240px;max-width:100%;"><figcaption>${position.toUpperCase()}</figcaption></figure>`).join('')}</div>
        <p>These bars are illustrations only. During the trials, imagine the bar yourself and keep it in mind while comparing the two visible red lines.</p>
        <p>Respond when the question appears: ${keySame} = same length, ${keyDifferent} = different lengths. Then rate the vividness of the imagined bar.</p>
        <p>${blockPosition > 1 ? `First, complete ${review_mode === 'on' ? '1 full-task practice trial' : `${linePairs.length} full-task practice trials`} with this bar position. Click Next to start practice.` : 'Click Next when you are ready to begin this block.'}</p>
    </div>`];
}
