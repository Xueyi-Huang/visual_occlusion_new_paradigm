function same_or_different_instruction_pages() {
    return [
        "<div class='instructions left-aligned'>" +
            "<p>While reading the instructions that follow, you can go back to " +
            "previous pages using the \"Previous\" button below. " +
            "<strong>Do not click the \"back\" button in your browser</strong> at any time " +
            "during the experiment, including during the instructions, unless you no longer " +
            "wish to participate in the experiment.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" + 
            "<p>Welcome! " +
            "Thanks for helping us better understand how people's vision and imagination work. First, we'll give you some instructions and practice trials that will take you about five minutes to complete. Then, you'll proceed to the experimental trials and a questionnaire at the end. <br><br>There are two types of tasks in the study. Your first task is to determine <strong>whether two shapes are the same or different as fast as you can</strong>.</p>" +
        "</div>",
        
        "<div class='instructions left-aligned'>" +
            "<p>Throughout each trial, a fixation cross will be present from the beginning. It is crucial to maintain your gaze on it until the next screen.</p>" + 
            '<img src="' + illustrationImage[0] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Then you will see three shapes on the screen. Please ignore the third shape in the top or bottom corner. Your task is to determine whether the two shapes <strong>in the middle of the screen</strong> are the same or different. If they are <strong>the same</strong>, press key <strong>" + keySame + "</strong>. If they are <strong>different</strong>, press key <strong>" + keyDifferent + "</strong>.</p>" +
            "<p>In this example, there are two circles in the middle. So you'd need to press key <strong>" + keySame + "</strong> to indicate they are <strong>the same</strong>. </p>" +
            '<img src="' + illustrationImage[2] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>This is another example of a same response. You'd need to press key <strong>" + keySame + "</strong> to indicate they are <strong>the same</strong>. </p>" +
            '<img src="' + illustrationImage[4] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",
           
        "<div class='instructions left-aligned'>" +
            "<p>In this figure, there are a circle and a square in the middle. So you'd need to press key <strong>" + keyDifferent + "</strong> to indicate they are <strong>different</strong>.</p>" +
            '<img src="' + illustrationImage[3] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>This is another example of a different response. You'd need to press key <strong>" + keyDifferent + "</strong> to indicate they are <strong>different</strong>. </p>" +
            '<img src="' + illustrationImage[5] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Let's do a couple of practice trials before we continue.</p>" +
            "<p>We really need you to be <strong>as fast as possible</strong> at the same/different task. So, <strong>please place two fingers from your left hand on key " + keySame + " and key " + keyDifferent + "</strong>, respectively, and use your left thumb to press the spacebar (which you'll need to do if you miss a trial). Keep your right hand on your mouse.</p>" + 
            "<p>You won't be able to return to these instructions " +
            "once you've started these practice trials, so <strong>go back now if you want to " +
            "reread anything</strong>.</p>" +
            "<p>If you are ready, click \"Next\" to start practice.</p>" +
        "</div>",
]};

function imagination_instruction_pages() {
    return [
        "<div class='instructions left-aligned'>" + 
            "For the second half of the task, you will need to <strong>imagine two shapes as vividly as you can</strong>.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>In this part of the task, two shapes will appear briefly and then disappear, leaving an empty screen with a bounding dotted-line box. Your task is to <strong>imagine exactly what the two shapes look like in their original places</strong>.</p>" +
            '<img src="' + illustrationGif[0] + '" style="width: 380px; height: auto; display: block; margin: auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Please visualize the shapes on the empty screen <strong>with your eyes open</strong>, and make sure to keep the mental image of the shapes in your mind's eye as exactly as they appear and as vividly as possible <strong>until the next screen appears</strong>.</p>" +
            '<img src="' + illustrationGif[1] + '" style="width: 405px; height: auto; display: block; margin: auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>The two shapes may vary in orientation or have different spatial relationships across trials. Regardless, you should <strong>imagine the exact two shapes in their orignial places</strong>. Here are some examples you may need to imagine.</p>" + // more space between rows and columns
            '<img src="' + illustrationImage[16] + '" width="450px" height="auto" style="display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Then, you will be asked to rate the vividness of your mental image during the trial. Place your right hand on your mouse to click the button with your rating. <br><br>1 = Not vivid at all, 2 = Slightly vivid, 3 = Moderately vivid, 4 = Very vivid, 5 = Perfectly vivid </p>" +
            "<p>You'll need to evaluate and rate each trial <strong>based on your experience during that specific one</strong>, independently of how you've rated other trials. </p>" +
            '<img src="' + illustrationImage[9] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Let's do a couple of practice trials before we continue.</p>" +
            "<p>Please, really try your best to imagine the shapes <strong>exactly as they appear and as vividly as possible</strong> on each trial." +
            "<p>You won't be able to return to these instructions " +
            "once you've started these practice trials, so <strong>go back now if you want to " +
            "reread anything</strong>.</p>" +
            "<p>If you are ready, click \"Next\" to start practice.</p>" +
        "</div>",
]};

function practice_instruction_pages() {
    return [
        "<div class='instructions left-aligned'>" +
            "<p>Well done!</p>" +
            "<p>Now, let's combine the imagination task with the same/different task. Click \"Next\" to read the complete procedure.</p>" +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>In the beginning of each trial, a fixation cross will be present in the center of the screen. It is crucial to maintain your gaze in the center throughout the study.</p>" + 
            '<img src="' + illustrationImage[0] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Then, two shapes will appear briefly and then disappear, leaving an empty screen with a bounding dotted-line box. Your task is to <strong>imagine exactly what the two shapes look like in their original places</strong>.</p>" +
            '<img src="' + illustrationGif[0] + '" style="width: 380px; height: auto; display: block; margin: auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>You'll need to keep imagining the two shapes as vivdly as possible until a new set of three shapes appear on the screen. When they do, you'll proceed with the same/different task. As before, your task is to determine whether the two shapes <strong>in the middle of the screen</strong> are the same or different. </p>" +
            "<p>As a reminder, if they are <strong>the same</strong>, press key <strong>" + keySame + "</strong>. If they are <strong>different</strong>, press key <strong>" + keyDifferent + "</strong>. Please ignore the third shape in the top or bottom corner, but the same pattern applies: the second item in the same/different pair always appears on the opposite side of the shape that appeared in the corner at the beginning of the trial.</p>" + 
            '<img src="' + illustrationImage[2] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Finally, you will be asked to rate the vividness of your mental image during the trial. Place your right hand on your mouse to click the button with your rating. <br><br>1 = Not vivid at all, 2 = Slightly vivid, 3 = Moderately vivid, 4 = Very vivid, 5 = Perfectly vivid </p>" +
            "<p>You'll need to evaluate and rate each trial <strong>based on your experience during that specific one</strong>, independently of how you've rated other trials. </p>" +
            '<img src="' + illustrationImage[9] + '" style="width: 350px; height: auto; display: block; margin: 0 auto;"><br>' +
        "</div>",

        "<div class='instructions left-aligned'>" +
            "<p>Let's do a couple of practice trials before we continue.</p>" +
            "<p>Please really try your best to imagine the shapes <strong>exactly as they appear on the screen and as vividly as possible</strong>. We also need you to be <strong>as fast as possible</strong> at the same/different task. So <strong>please place two fingers from your left hand on key " + keySame + " and key " + keyDifferent + "</strong>, and use your left thumb to press the spacebar when you need it to advance. Keep your right hand on the mouse.</p>" +
            "<p>You won't be able to return to these instructions " +
            "once you've started these practice trials, so <strong>go back now if you want to " +
            "reread anything</strong>.</p>" +
            "<p>If you are ready, click \"Next\" to start practice.</p>" +
        "</div>",
]};

const wellcome_text = "<div><p>This experiment will run in fullscreen. Please do not exit " +
"fullscreen during the experiment unless you wish to stop.</p>" +
"<p>Please wait for a few seconds after you click the button. </p></div>"

const block_text = 'The refresh rate of your computer does not meet the requirements for this study. To participate in this experiment, ensure that your monitor has a minimum refresh rate of 60 frames per second. Or try to refresh the page.';

const good_frame_text = "<div><p>Everything looks great! <br>Click the button to read the instructions.</p> ";

const before_block_text_1 = "<div class='instructions left-aligned'>" +
    "<p>Well done! We'll start the real trials for this task now. These trials are exactly the same as the practice ones you just saw except that there will be no instruction text below.</p>" +
    "<p>Please try to <strong>stay focused</strong>. It's important that you pay attention to the screen all the time. Also find a comfortable position to look at the screen and then please make sure to stay in that position throughout the duration of the experiment. Small movements are ok, we just don't want you to move around too much.</p> " +
    "<p>Remember, <strong>the faster you make a same/different response, the better</strong>. But accuracy is also important. Additionally, please try to imagine the shapes <strong>exactly as they appear and as vivid as possible until the next screen appears</strong>. We appreciate your effort.</p>" +
    "<p>Press the space bar when you are ready to start. Good luck!</p></div>";

const break_text = "<div class='instructions left-aligned'>" +
    "<p>If you want, you can take a short break now (maybe just a few seconds). Just be mindful that if your break is too long, Prolific might not let you submit your work." +
    "<p>Press the space bar to continue.</p></div>";

const thank_you_text = "<div><p>Thank you for completing the experiment! Two brief questionnaires are all that remain. <br> Press the space bar to continue.</p></div>";


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