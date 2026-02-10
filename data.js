const RATIOS = [14, 23, 30, 35, 43, 57, 64, 71, 86];

const VIS_TYPES = [
  "aligned_bars",
  "stacked_bars",
  "pie_angle",
  "circle_area",
  "color_luminance",
  "line_slope",
  "color_saturation",
  "star_area"
];

// shuffle helper
function shuffle(array) {
  return d3.shuffle(array.slice());
}

function generateTrials() {
  let trials = [];

  shuffle(VIS_TYPES).forEach(viz => {
    shuffle(RATIOS).slice(0, 10).forEach((ratio, i) => {
      trials.push({
        vizType: viz,
        groundTruth: ratio,
        trialInBlock: i + 1
      });
    });
  });

  return trials;
}
