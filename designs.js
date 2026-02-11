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
  const big = 100;
  const small = big * (ratio / 100);

  const bars = Math.random() < 0.5
    ? [
        { value: big, fill: "#000000" },
        { value: small, fill: "orange" }
      ]
    : [
        { value: small, fill: "orange" },
        { value: big, fill: "#000000" }
      ];

  let yOffset = 300;

  svg.selectAll("rect")
    .data(bars)
    .join("rect")
    .attr("x", 200)
    .attr("width", 80)
    .attr("y", d => {
      yOffset -= d.value;
      return yOffset;
    })
    .attr("height", d => d.value)
    .attr("fill", d => d.fill);
  return {
    largerIndex: data.indexOf(big)
  };
};

designs.pie_angle = function(svg, ratio) {
  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(120);

  const slices = [
    { value: 100, target: false },           // reference (larger)
    { value: 100 * (ratio / 100), target: true }
  ];

  svg.append("g")
    .attr("transform", "translate(300,200)")
    .selectAll("path")
    .data(pie(slices))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d, i) => i === 0 ? "#187681" : "orange");

  return { largerSide: "left" };
};


designs.circle_area = function(svg, ratio) {
  const big = 80;
  const small = Math.sqrt(ratio / 100) * big;

  const cy = 200;
  const leftX = 180;
  const rightX = 420;

  svg.append("circle")
    .attr("cx", leftX)
    .attr("cy", cy)
    .attr("r", big)
    .attr("fill", "#ddd");

  svg.append("circle")
    .attr("cx", rightX)
    .attr("cy", cy)
    .attr("r", small)
    .attr("fill", "orange");

  return { largerSide: "left" };
};


/* ===============================
   NEW encodings
================================ */

designs.color_luminance = function(svg, ratio) {
  const w = 160;
  const h = 100;
  const y = 150;

  const leftLum = 0.8;                  // FIXED larger luminance
  const rightLum = ratio / 100;

  const leftX = 180;
  const rightX = 360;

  svg.append("rect")
    .attr("x", leftX)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d3.interpolateGreys(leftLum));

  svg.append("rect")
    .attr("x", rightX)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d3.interpolateGreys(rightLum));

  return { largerSide: "left" };
};

designs.line_slope = function(svg, ratio) {
  const delta = ratio * 1.5;
  const baseSlope = 30;

  const yBase = 300;
  const lineLen = 140;

  const leftX = 120;
  const rightX = 340;

  // larger slope on LEFT
  svg.append("line")
    .attr("x1", leftX)
    .attr("x2", leftX + lineLen)
    .attr("y1", yBase)
    .attr("y2", yBase - (baseSlope + delta))
    .attr("stroke", "orange")
    .attr("stroke-width", 4);

  svg.append("line")
    .attr("x1", rightX)
    .attr("x2", rightX + lineLen)
    .attr("y1", yBase)
    .attr("y2", yBase - baseSlope)
    .attr("stroke", "orange")
    .attr("stroke-width", 4);

  return { largerSide: "left" };
};


designs.color_saturation = function(svg, ratio) {
  const w = 160;
  const h = 100;
  const y = 150;

  const hue = 30;
  const lightness = 0.5;

  const leftSat = 0.9;                  // FIXED larger saturation
  const rightSat = ratio / 100;

  const leftX = 180;
  const rightX = 360;

  svg.append("rect")
    .attr("x", leftX)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d3.hsl(hue, leftSat, lightness));

  svg.append("rect")
    .attr("x", rightX)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d3.hsl(hue, rightSat, lightness));

  return { largerSide: "left" };
};


designs.star_area = function(svg, ratio) {
  const baseOuter = 50;
  const baseInner = 25;

  const scale = Math.sqrt(ratio / 100);

  const leftX = 200;
  const rightX = 400;
  const cy = 200;

  // Larger star on LEFT
  svg.append("path")
    .attr("d", starPath(leftX, cy, baseOuter, baseInner, 5))
    .attr("fill", "orange")
    .attr("stroke", "#333");

  svg.append("path")
    .attr("d", starPath(
      rightX,
      cy,
      baseOuter * scale,
      baseInner * scale,
      5
    ))
    .attr("fill", "orange")
    .attr("stroke", "#333");

  return { largerSide: "left" };
};
