const svg = d3.select("#viz");
const slider = document.getElementById("slider");
const sliderValue = document.getElementById("slider-value");
const nextBtn = document.getElementById("next-btn");

let trials = generateTrials();
let current = 0;
let startTime = null;
let results = [];

slider.oninput = () => {
  sliderValue.textContent = slider.value + "%";
};

function runTrial() {
  if (current >= trials.length) {
    finishExperiment();
    return;
  }

  svg.selectAll("*").remove();

  const t = trials[current];
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

runTrial();