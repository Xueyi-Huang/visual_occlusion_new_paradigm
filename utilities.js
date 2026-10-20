// from https://github.com/vassar-cogscilab/js-display-durations/blob/master/experiment/frame_rate_estimation.js
function estimate_frame_duration(callback, duration, trim) {
    let last = null;
    let frames = [];
    let start = performance.now();

    // Skip first frame to get more consistent estimate.
    window.requestAnimationFrame(function() {
        window.requestAnimationFrame(nextFrame);
    });

    function nextFrame(timestamp) {
        if (last !== null) {
            let frame_duration = timestamp - last;
            frames.push(frame_duration);
        }
        last = timestamp;
        let remaining = duration - (timestamp - start);
        if (remaining > 0) {
            window.requestAnimationFrame(nextFrame);
        } else {
            done();
        }
    }

    function done() {
        let toSum = null;
        if (trim) {
            let sorted = frames.sort();
            toSum = sorted.slice(Math.round(sorted.length*0.1), Math.round(sorted.length*0.9));
        } else {
            toSum = frames;
        }
        let sum = toSum.reduce(function(total, num) { return total + num; });
        callback(sum / toSum.length);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getBrowser() {
	var userAgent = navigator.userAgent.toLowerCase(),
		browser   = '',
		version   = 0;

	$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());

	// Is this a version of IE?
	if ($.browser.msie) {
	  userAgent = $.browser.version;
	  userAgent = userAgent.substring(0,userAgent.indexOf('.'));
	  version = userAgent;
	  browser = "Internet Explorer";
	}

	// Is this a version of Chrome?
	if ($.browser.chrome) {
	  userAgent = userAgent.substring(userAgent.indexOf('chrome/') + 7);
	  userAgent = userAgent.substring(0,userAgent.indexOf('.'));
	  version = userAgent;
	  // If it is chrome then jQuery thinks it's safari so we have to tell it it isn't
	  $.browser.safari = false;
	  browser = "Chrome";
	}

	// Is this a version of Safari?
	if ($.browser.safari) {
	  userAgent = userAgent.substring(userAgent.indexOf('safari/') + 7);
	  userAgent = userAgent.substring(0,userAgent.indexOf('.'));
	  version = userAgent;
	  browser = "Safari";
	}

	// Is this a version of Mozilla?
	if ($.browser.mozilla) {
		//Is it Firefox?
		if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
			userAgent = userAgent.substring(userAgent.indexOf('firefox/') + 8);
			userAgent = userAgent.substring(0,userAgent.indexOf('.'));
			version = userAgent;
			browser = "Firefox"
		}
		// If not then it must be another Mozilla
		else {
		  browser = "Mozilla (not Firefox)"
		}
	}

	// Is this a version of Opera?
	if ($.browser.opera) {
		userAgent = userAgent.substring(userAgent.indexOf('version/') + 8);
		userAgent = userAgent.substring(0,userAgent.indexOf('.'));
		version = userAgent;
		browser = "Opera";
	}

	// Now you have two variables, browser and version
	// which have the right info

	return [browser,version];
}

// Physical screen calibration; no card information or photographs are collected.
function createScreenCalibration(jsPsych) {
    return {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['questionnaire-page'],
        stimulus: screen_calibration_text,
        choices: 'NO_KEYS',
        data: {stage: 'screen_calibration'},
        on_load: function() {
            const slider = document.getElementById('card-size-slider');
            const card = document.getElementById('calibration-card');
            const confirmation = document.getElementById('calibration-distance');
            const button = document.getElementById('calibration-continue');
            const message = document.getElementById('calibration-message');
            let adjusted = false;
            slider.max = Math.max(200, Math.min(800, window.innerWidth - 80));
            slider.value = Math.min(320, Number(slider.max));
            function update() {
                card.style.width = `${slider.value}px`;
                button.disabled = !adjusted || !confirmation.checked;
                message.textContent = '';
            }
            slider.addEventListener('input', function() {
                adjusted = true;
                update();
            });
            confirmation.addEventListener('change', update);
            update();
            button.addEventListener('click', function() {
                const cardWidthPx = card.getBoundingClientRect().width;
                const pixelsPerCm = cardWidthPx / 8.56;
                const cellSize = Math.round(2 * viewingDistanceCm * Math.tan(stimulusAngles.gridCell * Math.PI / 360) * pixelsPerCm);
                const frameSize = cellSize * 5;
                if (frameSize > Math.min(window.innerWidth - 48, window.innerHeight - 180)) {
                    message.textContent = 'The task display would not fit this window. Please check the card match and maximize your window, or use a larger screen.';
                    return;
                }
                applyScreenCalibration(pixelsPerCm);
                const calibration = {
                    pixels_per_cm: pixelsPerCm,
                };
                jsPsych.data.addProperties(calibration);
                jsPsych.finishTrial({response: JSON.stringify(calibration)});
            });
        },
        on_finish: function() {
            if (save_data_locally !== 'on') saveData();
        },
    };
}

// Stimulus geometry and SVG helpers.
function svgDataUrl(svgMarkup) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
}

function applyScreenCalibration(pixelsPerCm) {
    if (!Number.isFinite(pixelsPerCm) || pixelsPerCm <= 0 || viewingDistanceCm <= 0) {
        throw new Error('Display dimensions and viewing distance must be positive numbers.');
    }
    displayPixelsPerCm = pixelsPerCm;
    const pixelsForDegrees = degrees => Math.max(1, Math.round(
        2 * viewingDistanceCm * Math.tan(degrees * Math.PI / 360) * pixelsPerCm
    ));
    gridCellSize = pixelsForDegrees(stimulusAngles.gridCell);
    taskFrameSize = gridCellSize * 5;
    shortLine = pixelsForDegrees(stimulusAngles.shortLine);
    longLine = pixelsForDegrees(stimulusAngles.longLine);
    lineWidth = pixelsForDegrees(stimulusAngles.lineWidth);
    gridLineWidth = 1; // Keep the original subtle dashed grid at every display scale.
    taskFrameBorderWidth = pixelsForDegrees(stimulusAngles.frameBorderWidth);
    linePairs = [[shortLine, shortLine], [longLine, longLine], [shortLine, longLine], [longLine, shortLine]];
    document.documentElement.style.setProperty('--task-frame-size', `${taskFrameSize}px`);
    document.documentElement.style.setProperty('--task-frame-border-width', `${taskFrameBorderWidth}px`);
    document.documentElement.style.setProperty('--task-frame-border-color', taskFrameBorderColor);
}

function taskFrameOutline() {
    const inset = taskFrameBorderWidth / 2;
    const extent = taskFrameSize - taskFrameBorderWidth;
    return `<rect x="${inset}" y="${inset}" width="${extent}" height="${extent}" fill="none" stroke="${taskFrameBorderColor}" stroke-width="${taskFrameBorderWidth}"/>`;
}

function gridStimulus(lineLengths = null) {
    const size = taskFrameSize;
    let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="lightgray"/>`;
    for (const column of [1, 3]) {
        markup += `<rect x="${column * gridCellSize}" y="${2 * gridCellSize}" width="${gridCellSize}" height="${gridCellSize}" fill="${squareColor}"/>`;
    }
    for (let i = 1; i < 5; i++) {
        const coordinate = i * gridCellSize;
        markup += `<path d="M ${coordinate} 0 V ${size} M 0 ${coordinate} H ${size}" stroke="#999" stroke-width="${gridLineWidth}" stroke-dasharray="5 5"/>`;
    }
    if (lineLengths) {
        lineLengths.forEach((length, index) => {
            const x = (index === 0 ? 1.5 : 3.5) * gridCellSize;
            const y = size / 2;
            markup += `<line x1="${x}" y1="${y - length / 2}" x2="${x}" y2="${y + length / 2}" stroke="#00C900" stroke-width="${lineWidth}"/>`;
        });
    }
    return svgDataUrl(markup + taskFrameOutline() + '</svg>');
}

function occluderIllustration(position = 'middle') {
    let markup = decodeURIComponent(gridStimulus().split(',')[1]);
    const cell = gridCellSize;
    const geometry = {
        middle: [2 * cell, cell, cell, 3 * cell],
        top: [cell, cell, 3 * cell, cell],
        bottom: [cell, 3 * cell, 3 * cell, cell],
        behind: [0, 2 * cell, 5 * cell, cell],
    }[position];
    const [x, y, width, height] = geometry;
    let bar = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${occluderColor}"/>`;
    if (position === 'behind') {
        // Redraw the squares in front of the imagined bar.
        for (const column of [1, 3]) {
            bar += `<rect x="${column * cell}" y="${2 * cell}" width="${cell}" height="${cell}" fill="${squareColor}"/>`;
        }
    }
    return svgDataUrl(markup.replace('</svg>', bar + taskFrameOutline() + '</svg>'));
}
