const designs = {};

// Helper: generate distractors
function randomValues(n = 10) {
  return d3.range(n).map(() => Math.random() * 100);
}

/* ===============================
   Cleveland & McGill style
================================ */

designs.aligned_bars = function(svg, ratio) {
  const data = randomValues();
  const big = 100;
  const small = big * (ratio / 100);
  data.push(big, small);

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
    .attr("fill", d => (d === big || d === small) ? "orange" : "#bbb");
};

designs.stacked_bars = function(svg, ratio) {
  const big = 100;
  const small = big * (ratio / 100);

  svg.append("rect")
    .attr("x", 200)
    .attr("y", 300 - big)
    .attr("width", 80)
    .attr("height", big)
    .attr("fill", "#ccc");

  svg.append("rect")
    .attr("x", 200)
    .attr("y", 300 - small)
    .attr("width", 80)
    .attr("height", small)
    .attr("fill", "orange");
};

designs.pie_angle = function(svg, ratio) {
  const pie = d3.pie();
  const arc = d3.arc().innerRadius(0).outerRadius(120);

  const data = [ratio, 100 - ratio];

  svg.append("g")
    .attr("transform", "translate(300,200)")
    .selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d, i) => i === 0 ? "orange" : "#ddd");
};

designs.circle_area = function(svg, ratio) {
  const big = 80;
  const small = Math.sqrt(ratio / 100) * big;

  svg.append("circle")
    .attr("cx", 250)
    .attr("cy", 200)
    .attr("r", big)
    .attr("fill", "#ddd");

  svg.append("circle")
    .attr("cx", 350)
    .attr("cy", 200)
    .attr("r", small)
    .attr("fill", "orange");
};

/* ===============================
   NEW encodings
================================ */

designs.color_luminance = function(svg, ratio) {
  svg.append("rect")
    .attr("x", 200)
    .attr("y", 150)
    .attr("width", 200)
    .attr("height", 100)
    .attr("fill", d3.interpolateGreys(ratio / 100));
};

designs.line_slope = function(svg, ratio) {
  svg.append("line")
    .attr("x1", 100)
    .attr("y1", 300)
    .attr("x2", 500)
    .attr("y2", 300 - ratio * 2)
    .attr("stroke", "orange")
    .attr("stroke-width", 4);
};

designs.radial_position = function(svg, ratio) {
  svg.append("circle")
    .attr("cx", 300)
    .attr("cy", 200)
    .attr("r", ratio * 1.5)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 4);
};

designs.star_area = function(svg, ratio) {
  const r = Math.sqrt(ratio) * 5;
  const points = d3.range(10).map(i => {
    const angle = (i / 10) * Math.PI * 2;
    const radius = i % 2 === 0 ? r : r / 2;
    return [
      300 + radius * Math.cos(angle),
      200 + radius * Math.sin(angle)
    ];
  });

  svg.append("polygon")
    .attr("points", points.join(" "))
    .attr("fill", "orange");
};