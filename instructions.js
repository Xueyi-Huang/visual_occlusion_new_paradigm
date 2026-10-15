const wellcome_text = '<p>This experiment runs in fullscreen. Click Begin to continue.</p>';
const block_text = 'This study requires a display running at 60 Hz or faster. Please refresh the page or use another display.';
const good_frame_text = '<p>Display check complete. Click Next to read the instructions.</p>';
const response_instructions = `
    <p>Keep looking at the center of the box. Two vertical red lines will appear, one in each black square. Compare their visible lengths.</p>
    <p>Wait until the question “Same or different length?” appears, then press <strong>${keySame}</strong> for the same length or <strong>${keyDifferent}</strong> for different lengths.</p>
    <p>Respond as quickly and accurately as you can, within ${maxResponseTime / 1000} seconds of the question appearing. Do not guess before seeing the lines.</p>
    <p>Green feedback means correct; red feedback means incorrect. Responses within ${minResponseTime} ms of the question trigger a warning, as do missed responses. Press Space to continue after a warning.</p>`;
const imagery_instructions = `
    <p>Before the lines appear, imagine an occluder in the middle of the grid, between the two black squares. The occluder is a mental image: it will not be drawn on the screen.</p>
    <p>Form the image while the cue is shown and keep imagining it while you view the red lines. Judge only the lengths of the two visible red lines.</p>
    <p>After your response and feedback, use the mouse to rate how vivid your imagined occluder was: 1 = not vivid at all, 5 = perfectly vivid. Rate your mental image, rather than your confidence in the line judgment.</p>`;
const line_practice_pages = [
    `<div class="instructions left-aligned"><h2>Practice 1: Compare the lines</h2>
    <p>First, you will practice judging line lengths. There is no imagery task or vividness rating in this round.</p>
    ${response_instructions}
    <p>You will complete ${review_mode === 'on' ? '1 practice trial' : `${linePairs.length} practice trials`}. Click Next when you are ready.</p></div>`,
];
const imagery_practice_pages = [
    `<div class="instructions left-aligned"><h2>Practice 2: Imagine and compare</h2>
    <p>Now you will practice the full task.</p>${imagery_instructions}
    <p>The response keys and feedback are the same as before. You will complete ${review_mode === 'on' ? '1 practice trial' : `${linePairs.length} practice trials`}. Click Next when you are ready.</p></div>`,
];
const before_block_text_1 = `<div class="instructions left-aligned">
    <h2>Main task</h2>
    <p>Practice is complete. Continue using the same sequence:</p>
    <p>Look at the fixation cross, imagine an occluder in the middle of the grid, compare the visible red lines, and respond when the question appears.</p>
    <p><strong>${keySame}</strong> = same length; <strong>${keyDifferent}</strong> = different lengths. Then rate the vividness of your imagined occluder from 1 to 5.</p>
    <p>Keep your gaze at the center and respond as quickly and accurately as possible. Press Space to start the main task.</p>
</div>`;
const thank_you_text = '<p>Thank you for completing the experiment! Press the space bar to finish.</p>';

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
