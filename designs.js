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
};

designs.stacked_bars = function(svg, ratio) {
  const big = 100;
  const small = big * (ratio / 100);

  const bars = Math.random() < 0.5
    ? [
        { value: big, fill: "#000000" },
        { value: small, fill: "pink" }
      ]
    : [
        { value: small, fill: "pink" },
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
};

designs.pie_angle = function(svg, ratio) {
  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(120);

  const slices = Math.random() < 0.5
    ? [
        { value: ratio, target: true },
        { value: 100 - ratio, target: false }
      ]
    : [
        { value: 100 - ratio, target: false },
        { value: ratio, target: true }
      ];

  svg.append("g")
    .attr("transform", "translate(300,200)")
    .selectAll("path")
    .data(pie(slices))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => d.data.target ? "pink" : "#187681");
};

designs.circle_area = function(svg, ratio) {
  const big = 80;
  const small = Math.sqrt(ratio / 100) * big;

  const cy = 200;
  const padding = big + 10;   // ensure full visibility

  // Two safe x positions
  const leftX  = padding;
  const rightX = 600 - padding; // assuming ~600px wide SVG

  const circles = Math.random() < 0.5
    ? [
        { r: big,   cx: leftX,  fill: "#ddd", target: false },
        { r: small, cx: rightX, fill: "orange", target: true }
      ]
    : [
        { r: small, cx: leftX,  fill: "orange", target: true },
        { r: big,   cx: rightX, fill: "#ddd", target: false }
      ];

  svg.selectAll("circle")
    .data(circles)
    .join("circle")
    .attr("cx", d => d.cx)
    .attr("cy", cy)
    .attr("r", d => d.r)
    .attr("fill", d => d.fill);
};

/* ===============================
   NEW encodings
================================ */

designs.color_luminance = function(svg, ratio) {
  const w = 160;
  const h = 100;
  const y = 150;

  const targetLum = ratio / 100;
  const refLum = 0.5;   // fixed reference (adjust if needed)

  const leftX  = 180;
  const rightX = 360;

  const patches = Math.random() < 0.5
    ? [
        { x: leftX,  lum: targetLum, target: true },
        { x: rightX, lum: refLum,    target: false }
      ]
    : [
        { x: leftX,  lum: refLum,    target: false },
        { x: rightX, lum: targetLum, target: true }
      ];

  svg.selectAll("rect")
    .data(patches)
    .join("rect")
    .attr("x", d => d.x)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d => d3.interpolateGreys(d.lum));
};

designs.line_slope = function(svg, ratio) {
  const delta = ratio * 1.5;   // difference in slope
  const baseSlope = 15;        // mild reference angle

  const yBase = 300;
  const lineLen = 140;

  const leftX  = 120;
  const rightX = 340;

  const lines = Math.random() < 0.5
    ? [
        { x: leftX,  slope: baseSlope + delta, target: true },
        { x: rightX, slope: baseSlope,         target: false }
      ]
    : [
        { x: leftX,  slope: baseSlope,         target: false },
        { x: rightX, slope: baseSlope + delta, target: true }
      ];

  svg.selectAll("line")
    .data(lines)
    .join("line")
    .attr("x1", d => d.x)
    .attr("x2", d => d.x + lineLen)
    .attr("y1", yBase)
    .attr("y2", d => yBase - d.slope)
    .attr("stroke", "orange")
    .attr("stroke-width", 4);
};

// designs.radial_position = function(svg, ratio) {
//   const bigR = ratio * 1.5;
//   const refR = 40;

//   const cy = 200;
//   const padding = Math.max(bigR, refR) + 10;

//   const leftX  = padding + 80;
//   const rightX = 600 - padding - 80; // assume ~600px SVG

//   const circles = Math.random() < 0.5
//     ? [
//         { cx: leftX,  r: bigR, target: true },
//         { cx: rightX, r: refR, target: false }
//       ]
//     : [
//         { cx: leftX,  r: refR, target: false },
//         { cx: rightX, r: bigR, target: true }
//       ];

//   svg.selectAll("circle")
//     .data(circles)
//     .join("circle")
//     .attr("cx", d => d.cx)
//     .attr("cy", cy)
//     .attr("r", d => d.r)
//     .attr("fill", "none")
//     .attr("stroke", "orange")
//     .attr("stroke-width", 4);
// };

designs.color_saturation = function(svg, ratio) {
  const w = 160;
  const h = 100;
  const y = 150;

  const hue = 30;          // orange hue
  const lightness = 0.5;   // fixed luminance

  const targetSat = ratio / 100;
  const refSat = 0.4;

  const leftX  = 180;
  const rightX = 360;

  const patches = Math.random() < 0.5
    ? [
        { x: leftX,  sat: targetSat, target: true },
        { x: rightX, sat: refSat,    target: false }
      ]
    : [
        { x: leftX,  sat: refSat,    target: false },
        { x: rightX, sat: targetSat, target: true }
      ];

  svg.selectAll("rect")
    .data(patches)
    .join("rect")
    .attr("x", d => d.x)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", d =>
      d3.hsl(hue, d.sat, lightness).toString()
    );
};

designs.star_area = function(svg, ratio) {
  const baseOuter = 50;
  const baseInner = 25;

  const scale = Math.sqrt(ratio / 100);

  const target = {
    outer: baseOuter * scale,
    inner: baseInner * scale,
    target: true
  };

  const reference = {
    outer: baseOuter,
    inner: baseInner,
    target: false
  };

  const cy = 200;
  const padding = Math.max(target.outer, baseOuter) + 10;

  const leftX  = padding + 120;
  const rightX = 600 - padding - 120; // assumes ~600px SVG

  const stars = Math.random() < 0.5
    ? [
        { ...target, cx: leftX },
        { ...reference, cx: rightX }
      ]
    : [
        { ...reference, cx: leftX },
        { ...target, cx: rightX }
      ];

  svg.selectAll("path")
    .data(stars)
    .join("path")
    .attr("d", d =>
      starPath(d.cx, cy, d.outer, d.inner, 5)
    )
    .attr("fill", "orange")
    .attr("stroke", "#333")
    .attr("stroke-width", 1);
};