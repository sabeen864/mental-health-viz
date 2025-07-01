// Load data
d3.csv("data/mental_health_cleaned.csv").then(data => {

  // Convert numeric values
  data.forEach(d => {
    d.Age = +d.Age;
    d.treatment = +d.treatment;
  });

  // ==== Chart 1: Treatment by Gender (Bar) ====
  const treatmentByGender = d3.rollup(data, v => d3.sum(v, d => d.treatment), d => d.Gender);
  const tData = Array.from(treatmentByGender, ([gender, count]) => ({gender, count}));

  const width = 500, height = 400;

  const svg1 = d3.select("#chart1")
    .append("svg").attr("width", width).attr("height", height);

  const x1 = d3.scaleBand()
    .domain(tData.map(d => d.gender))
    .range([60, width - 30])
    .padding(0.4);

  const y1 = d3.scaleLinear()
    .domain([0, d3.max(tData, d => d.count)])
    .range([height - 50, 30]);

  svg1.selectAll("rect")
    .data(tData)
    .join("rect")
    .attr("x", d => x1(d.gender))
    .attr("y", d => y1(d.count))
    .attr("height", d => y1(0) - y1(d.count))
    .attr("width", x1.bandwidth())
    .attr("fill", "teal")
    .append("title")
    .text(d => `Treatment: ${d.count}`);

  svg1.append("g")
    .attr("transform", `translate(0, ${height - 50})`)
    .call(d3.axisBottom(x1));

  svg1.append("g")
    .attr("transform", "translate(60, 0)")
    .call(d3.axisLeft(y1));

  svg1.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Number of People Receiving Treatment by Gender");

  // ==== Chart 2: Age Distribution (Histogram) ====
  const svg2 = d3.select("#chart2")
    .append("svg").attr("width", width).attr("height", height);

  const ageBins = d3.bin().thresholds(20)(data.map(d => d.Age));
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(ageBins, d => d.length)])
    .range([height - 50, 30]);

  const x2 = d3.scaleLinear()
    .domain([15, 80])
    .range([60, width - 30]);

  svg2.selectAll("rect")
    .data(ageBins)
    .join("rect")
    .attr("x", d => x2(d.x0))
    .attr("y", d => y2(d.length))
    .attr("width", d => x2(d.x1) - x2(d.x0) - 1)
    .attr("height", d => y2(0) - y2(d.length))
    .attr("fill", "skyblue");

  svg2.append("g")
    .attr("transform", `translate(0, ${height - 50})`)
    .call(d3.axisBottom(x2));

  svg2.append("g")
    .attr("transform", "translate(60, 0)")
    .call(d3.axisLeft(y2));

  svg2.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Age Distribution of Participants");

  // ==== Chart 3: Remote Work vs Treatment (Grouped Bar) ====
  const groupData = d3.rollups(data,
    v => ({
      treated: d3.sum(v, d => d.treatment),
      total: v.length
    }),
    d => d.remote_work
  ).map(([remote, vals]) => ({
    remote, treated: vals.treated, untreated: vals.total - vals.treated
  }));

  const svg3 = d3.select("#chart3")
    .append("svg").attr("width", width).attr("height", height);

  const x3 = d3.scaleBand()
    .domain(groupData.map(d => d.remote))
    .range([60, width - 30])
    .padding(0.2);

  const y3 = d3.scaleLinear()
    .domain([0, d3.max(groupData, d => d.treated + d.untreated)])
    .range([height - 50, 30]);

  const subx = d3.scaleBand()
    .domain(["treated", "untreated"])
    .range([0, x3.bandwidth()])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(["treated", "untreated"])
    .range(["#4CAF50", "#FF7043"]);

  svg3.selectAll("g")
    .data(groupData)
    .join("g")
    .attr("transform", d => `translate(${x3(d.remote)},0)`)
    .selectAll("rect")
    .data(d => ["treated", "untreated"].map(key => ({key, value: d[key]})))
    .join("rect")
    .attr("x", d => subx(d.key))
    .attr("y", d => y3(d.value))
    .attr("width", subx.bandwidth())
    .attr("height", d => y3(0) - y3(d.value))
    .attr("fill", d => color(d.key));

  svg3.append("g")
    .attr("transform", `translate(0, ${height - 50})`)
    .call(d3.axisBottom(x3));

  svg3.append("g")
    .attr("transform", "translate(60, 0)")
    .call(d3.axisLeft(y3));

  svg3.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Remote Work vs Treatment (Grouped)");
});
"" 
