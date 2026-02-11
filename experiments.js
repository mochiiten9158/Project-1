const svg = d3.select("#viz");
const slider = document.getElementById("slider");
const sliderValue = document.getElementById("slider-value");
const nextBtn = document.getElementById("next-btn");

const ENCODING_DESCRIPTIONS = {
  aligned_bars: "You will compare the LENGTH of two bars aligned to a common baseline.",
  stacked_bars: "You will compare the LENGTH of stacked bar segments.",
  pie_angle: "You will compare the ANGLE of two pie slices.",
  circle_area: "You will compare the AREA of two circles.",
  line_slope: "You will compare the SLOPE (angle) of two lines.",
  color_luminance: "You will compare the LUMINANCE (brightness) of two color patches.",
  color_saturation: "You will compare the COLOR SATURATION (intensity) of two color patches.",
  star_area: "You will compare the AREA of two star-shaped glyphs."
};


let trials = generateTrials();
console.log(trials.length); // MUST be 90
let current = 0;
let startTime = null;
let results = [];

slider.oninput = () => {
  sliderValue.textContent = slider.value + "%";
};

const instructionsDiv = document.getElementById("instructions");
const experimentDiv = document.getElementById("experiment");
const startBtn = document.getElementById("start-btn");
const descriptionDiv = document.getElementById("encoding-description");

// Show all encoding types before starting
descriptionDiv.innerHTML = `
  <h3>What You Will Compare</h3>

  <p>
    In each trial, you will see <strong>two visual elements</strong>.
    One represents a larger value. One represents a smaller value.
  </p>

  <p>
    Your task is to estimate:
  </p>

  <p style="font-size:18px;">
    <strong>What percentage of the larger value is the smaller value?</strong>
  </p>

  <hr>

  <h4>Examples</h4>

  <ul>
    <li><strong>Bar Length</strong>: The taller bar is the larger value.</li>
    <li><strong>Pie Angle</strong>: The wider slice is the larger value.</li>
    <li><strong>Circle or Star Area</strong>: The shape covering more area is the larger value.</li>
    <li><strong>Line Slope</strong>: The steeper line represents the larger value.</li>
    <li><strong>Luminance (Brightness)</strong>: The lighter patch represents the larger value.</li>
    <li><strong>Saturation (Color Intensity)</strong>: The more vivid, intense color represents the larger value.</li>
  </ul>

  <hr>

  <h4>How to Respond</h4>

  <p>
    Use the slider at the bottom of the screen to enter your estimate.
  </p>

  <div style="margin:10px 0;">
    <input type="range" min="0" max="100" value="50" disabled class="demo-slider">
    <span>50%</span>
  </div>

  <p>
    Example: If the smaller value looks about half as large as the larger one,
    move the slider to <strong>50%</strong>.
  </p>

  <p>
    After selecting your answer, click <strong>Next</strong>.
  </p>
`;

function runTrial() {
  if (current >= trials.length) {
    finishExperiment();
    return;
  }

  svg.selectAll("*").remove();

  const t = trials[current];

  // Update prompt dynamically
  document.getElementById("prompt").innerHTML =
    ENCODING_DESCRIPTIONS[t.vizType] +
    "<br><br>What percentage of the larger value is the smaller value?";

  designs[t.vizType](svg, t.groundTruth);

  startTime = performance.now();
}

nextBtn.onclick = () => {
  const endTime = performance.now();
  const t = trials[current];

  results.push({
    vizType: t.vizType,
    trial: current + 1,
    groundTruth: t.groundTruth,
    response: +slider.value,
    responseTimeMs: Math.round(endTime - startTime)
  });

  current++;
  runTrial();
};

function finishExperiment() {
  document.getElementById("controls").style.display = "none";
  document.getElementById("completion").style.display = "block";
}

document.getElementById("download-btn").onclick = () => {
  const csv = d3.csvFormat(results);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "graphical_perception_results.csv";
  a.click();
};

let experimentStarted = false;

startBtn.onclick = () => {
  instructionsDiv.style.display = "none";
  experimentDiv.style.display = "block";

  experimentStarted = true;
  runTrial();   // NOW we begin
};
