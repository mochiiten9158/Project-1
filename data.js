const RATIOS = [14, 29, 43, 57, 71, 86];

const VIS_TYPES = [
  "aligned_bars",     // Cleveland & McGill
  "stacked_bars",     // Cleveland & McGill
  "pie_angle",        // Cleveland & McGill
  "circle_area",      // Heer & Bostock
  "color_luminance",  // NEW
  "line_slope",       // NEW
  "radial_position",  // NEW
  "star_area"         // NEW
];

// shuffle helper
function shuffle(array) {
  return d3.shuffle(array.slice());
}

function generateTrials() {
  let trials = [];

  shuffle(VIS_TYPES).forEach(viz => {
    shuffle(RATIOS).slice(0, 8).forEach((ratio, i) => {
      trials.push({
        vizType: viz,
        groundTruth: ratio,
        trialInBlock: i + 1
      });
    });
  });

  return trials;
}
