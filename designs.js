const designs = {};

// Helper: generate distractors
function randomValues(n = 10) {
  return d3.range(n).map(() => Math.random() * 100);
}

function starPath(cx, cy, outerR, innerR, points = 5) {
  const angle = Math.PI / points;
  let path = "";

  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * angle - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    path += (i === 0 ? "M" : "L") + x + "," + y;
  }

  return path + "Z";
}

/* ===============================
   Cleveland & McGill style
================================ */

designs.aligned_bars = function(svg, ratio) {
  const data = randomValues();

  const big = 100;
  const small = big * (ratio / 100);

  data.push(big, small);

  d3.shuffle(data);

  const x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([50, 550])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([350, 50]);

  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (_, i) => x(i))
    .attr("y", d => y(d))
    .attr("width", x.bandwidth())
    .attr("height", d => 350 - y(d))
    .attr("fill", d =>
      (d === big || d === small) ? "blue" : "#b6b6b6"
    );
    return {
    largerIndex: data.indexOf(big)
  };
};

designs.stacked_bars = function(svg, ratio) {

  const big = 100;                      // constant larger
  const small = big * (ratio / 100);    // varying smaller

  const baseY = 330;
  const barWidth = 60;

  const leftX = 220;
  const rightX = 340;

  // Randomize which side is target
  const targetOnLeft = Math.random() < 0.5;

  const targetX = targetOnLeft ? leftX : rightX;
  const distractorX = targetOnLeft ? rightX : leftX;

  //     TARGET STACK

  // Extra internal distractor segments
  const extraTop = 20 + Math.random() * 40;
  const extraBottom = 20 + Math.random() * 40;

  let yOffset = baseY;

  // bottom internal distractor
  svg.append("rect")
    .attr("x", targetX)
    .attr("y", yOffset - extraBottom)
    .attr("width", barWidth)
    .attr("height", extraBottom)
    .attr("fill", "#ccc");

  yOffset -= extraBottom;

  // SMALL (target comparison segment)
  svg.append("rect")
    .attr("x", targetX)
    .attr("y", yOffset - small)
    .attr("width", barWidth)
    .attr("height", small)
    .attr("fill", "orange");

  yOffset -= small;

  // LARGE (target comparison segment — always above small)
  svg.append("rect")
    .attr("x", targetX)
    .attr("y", yOffset - big)
    .attr("width", barWidth)
    .attr("height", big)
    .attr("fill", "#000000");

  yOffset -= big;

  // top internal distractor
  svg.append("rect")
    .attr("x", targetX)
    .attr("y", yOffset - extraTop)
    .attr("width", barWidth)
    .attr("height", extraTop)
    .attr("fill", "#ccc");


  //     DISTRACTOR STACK

  let dYOffset = baseY;

  const dBottom = 30 + Math.random() * 70;
  const dMiddle = 30 + Math.random() * 70;
  const dTop = 30 + Math.random() * 70;

  [dBottom, dMiddle, dTop].forEach(val => {
    svg.append("rect")
      .attr("x", distractorX)
      .attr("y", dYOffset - val)
      .attr("width", barWidth)
      .attr("height", val)
      .attr("fill", "#bbb");

    dYOffset -= val;
  });

  return {
    largerSide: targetOnLeft ? "left" : "right"
  };
};

designs.pie_angle = function(svg, ratio) {

  const outerRadius = 120;

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(outerRadius);

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  const referenceAngle = 180;
  const targetAngle = referenceAngle * (ratio / 100);

  const distractorCount = 4;
  const distractors = [];

  for (let i = 0; i < distractorCount; i++) {
    distractors.push({
      value: 40 + Math.random() * 80,
      type: "distractor"
    });
  }

  const slices = [
    { value: referenceAngle, type: "reference" },
    { value: targetAngle, type: "target" },
    ...distractors
  ];

  d3.shuffle(slices);

  const g = svg.append("g")
    .attr("transform", "translate(300,200)");

  g.selectAll("path")
    .data(pie(slices))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => {
      if (d.data.type === "reference") return "#187681";
      if (d.data.type === "target") return "orange";
      return "#cccccc";
    })
    .attr("stroke", d =>
      d.data.type === "reference" || d.data.type === "target"
        ? "black"
        : "none"
    )
    .attr("stroke-width", d =>
      d.data.type === "reference" || d.data.type === "target"
        ? 3
        : 0
    );

  return { largerType: "reference" };
};


designs.circle_area = function(svg, ratio) {
  const big = 80;
  const small = Math.sqrt(ratio / 100) * big;

  const targets = [
    { cx: 180, cy: 200, r: big, type: "reference" },
    { cx: 420, cy: 200, r: small, type: "target" }
  ];

  const distractors = [];
  const distractorCount = 4;
  const padding = 10;

  function overlaps(cx, cy, r) {
    return targets.concat(distractors).some(d => {
      const dx = cx - d.cx;
      const dy = cy - d.cy;
      return Math.sqrt(dx*dx + dy*dy) < d.r + r + padding;
    });
  }

  while (distractors.length < distractorCount) {
    const r = 20 + Math.random() * 60;
    const cx = 80 + Math.random() * 440;
    const cy = 80 + Math.random() * 240;

    if (Math.abs(r - small) < 6 || Math.abs(r - big) < 6) continue;

    if (!overlaps(cx, cy, r)) {
      distractors.push({ cx, cy, r, type: "distractor" });
    }
  }

  svg.selectAll("circle")
    .data([...targets, ...distractors])
    .join("circle")
    .attr("cx", d => d.cx)
    .attr("cy", d => d.cy)
    .attr("r", d => d.r)
    .attr("fill", d => d.type === "distractor" ? "#999" : "orange")
    .attr("stroke", d =>
      d.type === "distractor" ? "none" : "#000"
    )
    .attr("stroke-width", 2)
    .attr("opacity", 1);

  return { largerSide: "left" };
};


/* ===============================
   NEW encodings
================================ */

designs.color_luminance = function(svg, ratio) {

  const rows = 5;
  const cols = 5;
  const cellSize = 50;

  const offsetX = 200;
  const offsetY = 80;

  const cells = [];

  // Fixed brighter anchor
  const leftGreyValue = 0.2;

  const proportion = ratio / 100;

  const rightGreyValue =
    leftGreyValue + (1 - leftGreyValue) * (1 - proportion);

  // Random positions for the two targets
  const totalCells = rows * cols;
  const idx1 = Math.floor(Math.random() * totalCells);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * totalCells);
  } while (idx2 === idx1);

  for (let i = 0; i < totalCells; i++) {

    let value;
    let isTarget = false;

    if (i === idx1) {
      value = leftGreyValue;
      isTarget = true;
    } else if (i === idx2) {
      value = rightGreyValue;
      isTarget = true;
    } else {
      value = Math.random();
    }

    cells.push({ value, isTarget });
  }

  svg.selectAll("rect")
    .data(cells)
    .join("rect")
    .attr("x", (_, i) => offsetX + (i % cols) * cellSize)
    .attr("y", (_, i) => offsetY + Math.floor(i / cols) * cellSize)
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("fill", d => d3.interpolateGreys(d.value))
    .attr("stroke", d => d.isTarget ? "red" : "none")
    .attr("stroke-width", d => d.isTarget ? 3 : 0);

  return { largerSide: "brighterCell" };
};

designs.line_slope = function(svg, ratio) {

  const maxSlope = 160;   // constant larger slope (LEFT)
  const minSlope = 20;    // minimum slope

  // ratio = smaller is % of larger
  const proportion = ratio / 100;
  const smallerSlope = minSlope + (maxSlope - minSlope) * proportion;

  const yBase = 300;
  const lineLen = 140;

  const targets = [
    { x: 120, slope: maxSlope,     type: "reference" },
    { x: 340, slope: smallerSlope, type: "target" }
  ];

  svg.selectAll("line")
    .data(targets)
    .join("line")
    .attr("x1", d => d.x)
    .attr("x2", d => d.x + lineLen)
    .attr("y1", yBase)
    .attr("y2", d => yBase - d.slope)
    .attr("stroke", "orange")
    .attr("stroke-width", 4);

  return { largerSide: "left" };
};


designs.color_saturation = function(svg, ratio) {

  const rows = 5;
  const cols = 5;
  const cellSize = 50;

  const offsetX = 200;
  const offsetY = 80;

  const hue = 30;
  const lightness = 0.5;

  const leftSat = 0.9;   // constant anchor
  const rightSat = ratio / 100;

  const totalCells = rows * cols;
  const idx1 = Math.floor(Math.random() * totalCells);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * totalCells);
  } while (idx2 === idx1);

  const cells = [];

  for (let i = 0; i < totalCells; i++) {

    let sat;
    let isTarget = false;

    if (i === idx1) {
      sat = leftSat;
      isTarget = true;
    } else if (i === idx2) {
      sat = rightSat;
      isTarget = true;
    } else {
      sat = Math.random();
    }

    cells.push({ sat, isTarget });
  }

  svg.selectAll("rect")
    .data(cells)
    .join("rect")
    .attr("x", (_, i) => offsetX + (i % cols) * cellSize)
    .attr("y", (_, i) => offsetY + Math.floor(i / cols) * cellSize)
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("fill", d => d3.hsl(hue, d.sat, lightness))
    .attr("stroke", d => d.isTarget ? "red" : "none")
    .attr("stroke-width", d => d.isTarget ? 3 : 0);

  return { largerSide: "moreSaturatedCell" };
};


designs.star_area = function(svg, ratio) {

  const baseOuter = 50;
  const baseInner = 25;

  const scale = Math.sqrt(ratio / 100);

  const leftX  = 200;
  const rightX = 400;
  const cy     = 200;

  const targetRadius = baseOuter;

  // ---- TARGET STARS ----
  const targets = [
    {
      cx: leftX,
      cy,
      outer: baseOuter,
      inner: baseInner,
      type: "reference"
    },
    {
      cx: rightX,
      cy,
      outer: baseOuter * scale,
      inner: baseInner * scale,
      type: "target"
    }
  ];

  // ---- DISTRACTORS ----
  const distractorCount = 7;
  const distractors = [];
  const usedPositions = [...targets];

  function isFarEnough(cx, cy, r) {
    return usedPositions.every(p => {
      const dx = cx - p.cx;
      const dy = cy - p.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist > (r + p.outer + 20);
    });
  }

  for (let i = 0; i < distractorCount; i++) {
    let s, cx, cyOffset;

    do {
      s = 0.35 + Math.random() * 0.8;
      cx = 100 + Math.random() * 400;
      cyOffset = Math.random() < 0.5 ? 90 : -90;
    } while (
      Math.abs(s - 1) < 0.15 ||
      Math.abs(s - scale) < 0.15 ||
      !isFarEnough(cx, cy + cyOffset, baseOuter * s)
    );

    const star = {
      cx,
      cy: cy + cyOffset,
      outer: baseOuter * s,
      inner: baseInner * s,
      type: "distractor"
    };

    usedPositions.push(star);
    distractors.push(star);
  }

  const allStars = [...targets, ...distractors];

  svg.selectAll("path")
    .data(allStars)
    .join("path")
    .attr("d", d =>
      starPath(d.cx, d.cy, d.outer, d.inner, 5)
    )
    .attr("fill", d =>
      d.type === "distractor" ? "#b0b0b0" : "orange"
    )
    .attr("stroke", "#333")
    .attr("stroke-width", d =>
      d.type === "distractor" ? 1 : 2
    )
    .attr("opacity", 1);

  return { largerSide: "left" };
};