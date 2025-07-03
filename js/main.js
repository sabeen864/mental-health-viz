const dataUrl = "data/mental_health_cleaned.csv";

const stateMapping = {
    0: 'AL', 1: 'AZ', 2: 'CA', 3: 'CO', 4: 'CT', 5: 'DC', 6: 'FL', 7: 'GA', 8: 'IA', 9: 'ID',
    10: 'IL', 11: 'IN', 12: 'KS', 13: 'KY', 14: 'LA', 15: 'MA', 16: 'MD', 17: 'ME', 18: 'MI', 19: 'MN',
    20: 'MO', 21: 'MS', 22: 'NC', 23: 'NE', 24: 'NH', 25: 'NJ', 26: 'NM', 27: 'NV', 28: 'NY', 29: 'OH',
    30: 'OK', 31: 'OR', 32: 'PA', 33: 'RI', 34: 'SC', 35: 'SD', 36: 'TN', 37: 'TX', 38: 'UT', 39: 'VA',
    40: 'VT', 41: 'WA', 42: 'WI', 43: 'WV', 44: 'WY', 45: 'Unknown'
};

const consequenceMapping = {
    0: 'No',
    1: 'Yes',
    2: 'Maybe'
};

const employeesMapping = {
    0: '1-5',
    1: '6-25',
    2: '26-100',
    3: '100-500',
    4: '500-1000',
    5: '1000+'
};

const supervisorMapping = {
    0: 'No',
    1: 'Some',
    2: 'Yes'
};

const benefitsMapping = {
    0: 'No',
    1: 'Yes',
    2: 'Don\'t know'
};

const careOptionsMapping = {
    0: 'No',
    1: 'Yes',
    2: 'Not sure'
};

d3.csv(dataUrl).then(data => {
    console.log("Loaded Data:", data);

    // Map encoded values back to meaningful labels
    const cleanData = data.map(d => ({
        Age: +d.Age,
        Gender: d.Gender === '1' ? 'Male' : d.Gender === '0' ? 'Female' : 'Other',
        treatment: +d.treatment,
        remote_work: d.remote_work === '1' ? 'Yes' : 'No',
        Country: +d.Country,
        state: stateMapping[+d.state] || 'Unknown',
        no_employees: employeesMapping[+d.no_employees] || 'Unknown',
        mental_health_consequence: consequenceMapping[+d.mental_health_consequence] || 'Unknown',
        family_history: +d.family_history,
        benefits: benefitsMapping[+d.benefits] || 'Unknown',
        care_options: careOptionsMapping[+d.care_options] || 'Unknown',
        supervisor: supervisorMapping[+d.supervisor] || 'Unknown'
    })).filter(d => d.Country === 44); // Filter for US only

    let filteredData = [...cleanData];

    // Chart dimensions
    const margin = { top: 60, right: 30, bottom: 70, left: 70 };
    
    // Function to get container width, accounting for padding
    const getInitialWidth = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return 600;
        const style = window.getComputedStyle(container);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingRight);
        return container.clientWidth - paddingLeft - paddingRight;
    };
    
    let chart1Width = getInitialWidth('chart1-container');
    let width1 = chart1Width - margin.left - margin.right;
    
    let chart3Width = getInitialWidth('chart3-container');
    let width3 = chart3Width - margin.left - margin.right;

    let chart4Width = getInitialWidth('chart4-container');
    let width4 = chart4Width - margin.left - margin.right;

    let chart5Width = getInitialWidth('chart5-container');
    let width5 = chart5Width - margin.left - margin.right;

    let chart6Width = getInitialWidth('chart6-container');
    let width6 = chart6Width - margin.left - margin.right;

    let chart7Width = getInitialWidth('chart7-container');
    let width7 = chart7Width - margin.left - margin.right;

    const height = 400 - margin.top - margin.bottom;

    // Tooltip
    const tooltip = d3.select("#tooltip");

    // --- CHART 1: Treatment by Gender (Bar Chart) ---
    const svg1 = d3.select("#chart1-container").append("svg")
        .attr("width", chart1Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart1Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x1 = d3.scaleBand().range([0, width1]).padding(0.3);
    const y1 = d3.scaleLinear().range([height, 0]);

    svg1.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg1.append("g").attr("class", "y-axis");

    svg1.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width1 / 2)
        .attr("y", height + 50)
        .text("Gender");

    svg1.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Number of People Seeking Treatment");

    svg1.append("text")
        .attr("class", "chart-title")
        .attr("x", width1 / 2)
        .attr("y", -margin.top / 2 + 10)
        .text("Treatment Seekers by Gender");

    function updateChart1(data) {
        const treatmentByGender = d3.group(data, d => d.Gender);
        const chartData = Array.from(treatmentByGender, ([gender, values]) => ({
            gender,
            count: d3.sum(values, d => d.treatment)
        })).sort((a, b) => d3.descending(a.count, b.count));

        x1.domain(chartData.map(d => d.gender));
        y1.domain([0, d3.max(chartData, d => d.count) || 10]);

        svg1.select(".x-axis").transition().duration(500).call(d3.axisBottom(x1));
        svg1.select(".y-axis").transition().duration(500).call(d3.axisLeft(y1));

        const bars = svg1.selectAll(".bar").data(chartData, d => d.gender);

        bars.exit()
            .transition().duration(500)
            .attr("y", height)
            .attr("height", 0)
            .remove();

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x1(d.gender))
            .attr("y", height)
            .attr("width", x1.bandwidth())
            .attr("fill", "#3B82F6")
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`<strong>${d.gender}</strong><br/>Count: ${d.count}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0).classed("hidden", true))
            .on("click", (event, d) => {
                document.getElementById('genderFilter').value = d.gender;
                applyFilters();
            })
            .merge(bars)
            .transition().duration(500)
            .attr("x", d => x1(d.gender))
            .attr("y", d => y1(d.count))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y1(d.count));
    }

    // --- CHART 2: Age Distribution (Histogram) ---
    const svg2 = d3.select("#chart2-container").append("svg")
        .attr("width", chart1Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart1Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x2 = d3.scaleLinear().range([0, width1]);
    const y2 = d3.scaleLinear().range([height, 0]);
    
    svg2.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg2.append("g").attr("class", "y-axis");

    svg2.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", width1 / 2).attr("y", height + 50).text("Age");
    svg2.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 20).attr("x", -height / 2).text("Number of Participants");
    svg2.append("text").attr("class", "chart-title").attr("x", width1 / 2).attr("y", -margin.top / 2 + 10).text("Age Distribution");

    function updateChart2(data) {
        const ages = data.map(d => d.Age);
        x2.domain(d3.extent(ages)).nice();
        const bins = d3.bin().domain(x2.domain()).thresholds(20)(ages);
        y2.domain([0, d3.max(bins, d => d.length)]).nice();

        svg2.select(".x-axis").transition().duration(500).call(d3.axisBottom(x2));
        svg2.select(".y-axis").transition().duration(500).call(d3.axisLeft(y2));

        const histBars = svg2.selectAll(".hist-bar").data(bins);

        histBars.exit().remove();

        histBars.enter().append("rect")
            .attr("class", "hist-bar")
            .attr("x", 1)
            .attr("transform", d => `translate(${x2(d.x0)}, ${height})`)
            .attr("width", d => Math.max(0, x2(d.x1) - x2(d.x0) - 1))
            .attr("fill", "#10B981")
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`Age Range: ${d.x0}-${d.x1}<br/>Count: ${d.length}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0).classed("hidden", true))
            .on("click", (event, d) => {
                document.getElementById('ageFilter').value = d.x0;
                document.getElementById('ageValue').textContent = d.x0;
                applyFilters();
            })
            .merge(histBars)
            .transition().duration(500)
            .attr("transform", d => `translate(${x2(d.x0)}, ${y2(d.length)})`)
            .attr("width", d => Math.max(0, x2(d.x1) - x2(d.x0) - 1))
            .attr("height", d => height - y2(d.length));
    }

    // --- CHART 3: Remote Work vs Treatment (Grouped Bar Chart) ---
    const svg3 = d3.select("#chart3-container").append("svg")
        .attr("width", chart3Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart3Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x3Group = d3.scaleBand().range([0, width3]).padding(0.2);
    const x3Subgroup = d3.scaleBand().padding(0.05);
    const y3 = d3.scaleLinear().range([height, 0]);
    const color3 = d3.scaleOrdinal().domain(['Treated', 'Not Treated']).range(['#27AE60', '#E74C3C']);

    svg3.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg3.append("g").attr("class", "y-axis");

    svg3.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", width3 / 2).attr("y", height + 50).text("Work Location");
    svg3.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 20).attr("x", -height / 2).text("Number of Participants");
    svg3.append("text").attr("class", "chart-title").attr("x", width3 / 2).attr("y", -margin.top / 2 + 10).text("Treatment Status by Work Location");
    
    // Legend for Chart 3
    const legend3 = svg3.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(color3.domain().slice())
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20 - margin.top + 10})`);

    legend3.append("rect")
        .attr("x", width3 - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color3);

    legend3.append("text")
        .attr("x", width3 - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    function updateChart3(data) {
        const remoteMap = { 'Yes': 'Remote', 'No': 'On-site' };
        const subgroups = ['Treated', 'Not Treated'];
        
        const groupedData = d3.rollups(data, 
            v => ({
                'Treated': d3.sum(v, d => d.treatment),
                'Not Treated': v.length - d3.sum(v, d => d.treatment)
            }), 
            d => remoteMap[d.remote_work] || 'Other'
        );

        const chartData = Array.from(groupedData, ([group, values]) => ({group, ...values}));
        
        x3Group.domain(chartData.map(d => d.group));
        y3.domain([0, d3.max(chartData, d => Math.max(d['Treated'], d['Not Treated'])) || 10]).nice();
        x3Subgroup.domain(subgroups).range([0, x3Group.bandwidth()]);

        svg3.select(".x-axis").transition().duration(500).call(d3.axisBottom(x3Group));
        svg3.select(".y-axis").transition().duration(500).call(d3.axisLeft(y3));

        const group = svg3.selectAll(".group").data(chartData, d => d.group);

        group.exit().remove();
        
        const groupEnter = group.enter().append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x3Group(d.group)},0)`);

        group.merge(groupEnter).transition().duration(500)
            .attr("transform", d => `translate(${x3Group(d.group)},0)`);

        const bars = group.merge(groupEnter).selectAll("rect")
            .data(d => subgroups.map(key => ({key: key, value: d[key], group: d.group})));

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("x", d => x3Subgroup(d.key))
            .attr("y", height)
            .attr("width", x3Subgroup.bandwidth())
            .attr("fill", d => color3(d.key))
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`<strong>${d.group}</strong><br/>${d.key}: ${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0).classed("hidden", true))
            .on("click", (event, d) => {
                const remoteValue = d.group === 'Remote' ? 'Yes' : 'No';
                document.getElementById('remoteFilter').value = remoteValue;
                applyFilters();
            })
            .merge(bars)
            .transition().duration(500)
            .attr("x", d => x3Subgroup(d.key))
            .attr("y", d => y3(d.value))
            .attr("width", x3Subgroup.bandwidth())
            .attr("height", d => height - y3(d.value));
    }

    // --- CHART 4: Mental Health Consequences by Company Size (Stacked Bar Chart) ---
    const svg4 = d3.select("#chart4-container").append("svg")
        .attr("width", chart4Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart4Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x4 = d3.scaleBand().range([0, width4]).padding(0.2);
    const y4 = d3.scaleLinear().range([height, 0]);
    const color4 = d3.scaleOrdinal()
        .domain(['Yes', 'No', 'Maybe'])
        .range(['#8E44AD', '#9B59B6', '#C39BD3']);

    svg4.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg4.append("g").attr("class", "y-axis");

    svg4.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width4 / 2)
        .attr("y", height + 50)
        .text("Company Size");

    svg4.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Number of Respondents");

    svg4.append("text")
        .attr("class", "chart-title")
        .attr("x", width4 / 2)
        .attr("y", -margin.top / 2 + 10)
        .text("Mental Health Consequences by Company Size");

    // Legend for Chart 4
    const legend4 = svg4.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(color4.domain().slice())
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20 - margin.top + 10})`);

    legend4.append("rect")
        .attr("x", 0)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color4);

    legend4.append("text")
        .attr("x", 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    function updateChart4(data) {
        const subgroups = ['Yes', 'No', 'Maybe'];
        const groupedData = d3.rollups(data,
            v => ({
                'Yes': v.filter(d => d.mental_health_consequence === 'Yes').length,
                'No': v.filter(d => d.mental_health_consequence === 'No').length,
                'Maybe': v.filter(d => d.mental_health_consequence === 'Maybe').length
            }),
            d => d.no_employees
        );

        const chartData = Array.from(groupedData, ([group, values]) => ({ group, ...values }))
            .filter(d => d.group !== 'Unknown')
            .sort((a, b) => {
                const order = ['1-5', '6-25', '26-100', '100-500', '500-1000', '1000+'];
                return order.indexOf(a.group) - order.indexOf(b.group);
            });

        x4.domain(chartData.map(d => d.group));
        y4.domain([0, d3.max(chartData, d => d.Yes + d.No + d.Maybe) || 10]).nice();

        svg4.select(".x-axis").transition().duration(500).call(d3.axisBottom(x4));
        svg4.select(".y-axis").transition().duration(500).call(d3.axisLeft(y4));

        const stack = d3.stack().keys(subgroups);
        const stackedData = stack(chartData);

        const groups = svg4.selectAll(".group").data(stackedData, d => d.key);

        groups.exit().remove();

        const groupEnter = groups.enter().append("g")
            .attr("class", "group")
            .attr("fill", d => color4(d.key));

        groups.merge(groupEnter).selectAll("rect").data(d => d, d => d.data.group)
            .join(
                enter => enter.append("rect")
                    .attr("x", d => x4(d.data.group))
                    .attr("y", height)
                    .attr("width", x4.bandwidth())
                    .attr("height", 0)
                    .style("cursor", "pointer")
                    .on("mouseover", (event, d) => {
                        tooltip.style("opacity", 1).classed("hidden", false);
                        tooltip.html(`<strong>${d.data.group}</strong><br/>${stackedData.find(s => s.key === d3.select(event.target.parentNode).datum().key).key}: ${d[1] - d[0]}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", () => tooltip.style("opacity", 0).classed("hidden", true)),
                update => update,
                exit => exit.transition().duration(500).attr("y", height).attr("height", 0).remove()
            )
            .transition().duration(500)
            .attr("x", d => x4(d.data.group))
            .attr("y", d => y4(d[1]))
            .attr("height", d => y4(d[0]) - y4(d[1]))
            .attr("width", x4.bandwidth());
    }

    // --- CHART 5: Treatment by Family History (Pie Chart) ---
    const svg5 = d3.select("#chart5-container").append("svg")
        .attr("width", chart5Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart5Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${chart5Width / 2},${(height + margin.top + margin.bottom) / 2})`);

    const radius = Math.min(width5, height) / 2;
    const color5 = d3.scaleOrdinal()
        .domain(['With Family History', 'Without Family History'])
        .range(['#2ECC71', '#3498DB']);

    svg5.append("text")
        .attr("class", "chart-title")
        .attr("x", 0)
        .attr("y", -height / 2 - margin.top / 2 + 10)
        .attr("text-anchor", "middle")
        .text("Treatment by Family History");

    // Legend for Chart 5
    const legend5 = svg5.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(color5.domain().slice())
        .join("g")
        .attr("transform", (d, i) => `translate(${width5 / 2 - 30},${-height / 2 + i * 20 + 20})`);

    legend5.append("rect")
        .attr("x", -19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color5);

    legend5.append("text")
        .attr("x", -24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    function updateChart5(data) {
        const pieData = [
            { label: 'With Family History', value: d3.sum(data.filter(d => d.family_history === 1), d => d.treatment) },
            { label: 'Without Family History', value: d3.sum(data.filter(d => d.family_history === 0), d => d.treatment) }
        ].filter(d => d.value > 0);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg5.selectAll(".arc").data(pie(pieData), d => d.data.label);

        arcs.exit().remove();

        arcs.enter().append("g")
            .attr("class", "arc")
            .append("path")
            .attr("d", arc)
            .attr("fill", d => color5(d.data.label))
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`<strong>${d.data.label}</strong><br/>Count: ${d.data.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.target).transition().duration(200).attr("d", d3.arc().innerRadius(0).outerRadius(radius * 1.1));
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0).classed("hidden", true);
                d3.select(event.target).transition().duration(200).attr("d", arc);
            })
            .merge(arcs.select("path"))
            .transition().duration(500)
            .attr("d", arc);
    }

    // --- CHART 6: Supervisor Support by Company Size (Grouped Bar Chart) ---
    const svg6 = d3.select("#chart6-container").append("svg")
        .attr("width", chart6Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart6Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x6Group = d3.scaleBand().range([0, width6]).padding(0.2);
    const x6Subgroup = d3.scaleBand().padding(0.05);
    const y6 = d3.scaleLinear().range([height, 0]);
    const color6 = d3.scaleOrdinal().domain(['Yes', 'Some', 'No']).range(['#27AE60', '#F1C40F', '#E74C3C']);

    svg6.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg6.append("g").attr("class", "y-axis");

    svg6.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width6 / 2)
        .attr("y", height + 50)
        .text("Company Size");

    svg6.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Number of Respondents");

    svg6.append("text")
        .attr("class", "chart-title")
        .attr("x", width6 / 2)
        .attr("y", -margin.top / 2 + 10)
        .text("Supervisor Support by Company Size");

    // Legend for Chart 6
    const legend6 = svg6.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(color6.domain().slice())
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20 - margin.top + 10})`);

    legend6.append("rect")
        .attr("x", 0)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color6);

    legend6.append("text")
        .attr("x", 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    function updateChart6(data) {
        const subgroups = ['Yes', 'Some', 'No'];
        const groupedData = d3.rollups(data,
            v => ({
                'Yes': v.filter(d => d.supervisor === 'Yes').length,
                'Some': v.filter(d => d.supervisor === 'Some').length,
                'No': v.filter(d => d.supervisor === 'No').length
            }),
            d => d.no_employees
        );

        const chartData = Array.from(groupedData, ([group, values]) => ({ group, ...values }))
            .filter(d => d.group !== 'Unknown')
            .sort((a, b) => {
                const order = ['1-5', '6-25', '26-100', '100-500', '500-1000', '1000+'];
                return order.indexOf(a.group) - order.indexOf(b.group);
            });

        x6Group.domain(chartData.map(d => d.group));
        y6.domain([0, d3.max(chartData, d => Math.max(d.Yes, d.Some, d.No)) || 10]).nice();
        x6Subgroup.domain(subgroups).range([0, x6Group.bandwidth()]);

        svg6.select(".x-axis").transition().duration(500).call(d3.axisBottom(x6Group));
        svg6.select(".y-axis").transition().duration(500).call(d3.axisLeft(y6));

        const group = svg6.selectAll(".group").data(chartData, d => d.group);

        group.exit().remove();

        const groupEnter = group.enter().append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x6Group(d.group)},0)`);

        group.merge(groupEnter).transition().duration(500)
            .attr("transform", d => `translate(${x6Group(d.group)},0)`);

        const bars = group.merge(groupEnter).selectAll("rect")
            .data(d => subgroups.map(key => ({key: key, value: d[key], group: d.group})));

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("x", d => x6Subgroup(d.key))
            .attr("y", height)
            .attr("width", x6Subgroup.bandwidth())
            .attr("fill", d => color6(d.key))
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`<strong>${d.group}</strong><br/>${d.key}: ${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0).classed("hidden", true))
            .merge(bars)
            .transition().duration(500)
            .attr("x", d => x6Subgroup(d.key))
            .attr("y", d => y6(d.value))
            .attr("width", x6Subgroup.bandwidth())
            .attr("height", d => height - y6(d.value));
    }

    // --- CHART 7: Employees Who Sought Treatment by Benefits and Care Options (Heatmap) ---
    const svg7 = d3.select("#chart7-container").append("svg")
        .attr("width", chart7Width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${chart7Width} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x7 = d3.scaleBand().range([0, width7]).padding(0.05);
    const y7 = d3.scaleBand().range([height, 0]).padding(0.05);
    const color7 = d3.scaleSequential(d3.interpolateGreens).domain([0, 100]);

    svg7.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg7.append("g").attr("class", "y-axis");

    svg7.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width7 / 2)
        .attr("y", height + 50)
        .text("Benefits");

    svg7.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Care Options");

    svg7.append("text")
        .attr("class", "chart-title")
        .attr("x", width7 / 2)
        .attr("y", -margin.top / 2 + 10)
        .text("Employees Who Sought Treatment by Benefits and Care Options");

    function updateChart7(data) {
        const benefitsOrder = ['No', 'Yes', 'Don\'t know'];
        const careOptionsOrder = ['No', 'Yes', 'Not sure'];
        const heatmapData = d3.rollups(data.filter(d => d.treatment === 1 && d.benefits !== 'Unknown' && d.care_options !== 'Unknown'),
            v => v.length,
            d => d.benefits,
            d => d.care_options
        ).flatMap(([benefits, careGroup]) =>
            Array.from(careGroup, ([care_options, count]) => ({ benefits, care_options, count }))
        );

        x7.domain(benefitsOrder);
        y7.domain(careOptionsOrder);
        color7.domain([0, d3.max(heatmapData, d => d.count) || 10]);

        svg7.select(".x-axis").transition().duration(500).call(d3.axisBottom(x7));
        svg7.select(".y-axis").transition().duration(500).call(d3.axisLeft(y7));

        const cells = svg7.selectAll(".cell").data(heatmapData, d => `${d.benefits}:${d.care_options}`);

        cells.exit().remove();

        const cellEnter = cells.enter().append("g").attr("class", "cell");

        cellEnter.append("rect")
            .attr("x", d => x7(d.benefits))
            .attr("y", d => y7(d.care_options))
            .attr("width", x7.bandwidth())
            .attr("height", y7.bandwidth())
            .attr("fill", d => color7(d.count))
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).classed("hidden", false);
                tooltip.html(`Benefits: ${d.benefits}<br/>Care Options: ${d.care_options}<br/>Employees Sought Treatment: ${d.count}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.target).transition().duration(200).attr("opacity", 0.8);
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0).classed("hidden", true);
                d3.select(event.target).transition().duration(200).attr("opacity", 1);
            });

        cellEnter.append("text")
            .attr("x", d => x7(d.benefits) + x7.bandwidth() / 2)
            .attr("y", d => y7(d.care_options) + y7.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .attr("fill", d => d.count > color7.domain()[1] / 2 ? "white" : "black")
            .text(d => d.count);

        cells.select("rect")
            .transition().duration(500)
            .attr("x", d => x7(d.benefits))
            .attr("y", d => y7(d.care_options))
            .attr("width", x7.bandwidth())
            .attr("height", y7.bandwidth())
            .attr("fill", d => color7(d.count));

        cells.select("text")
            .transition().duration(500)
            .attr("x", d => x7(d.benefits) + x7.bandwidth() / 2)
            .attr("y", d => y7(d.care_options) + y7.bandwidth() / 2)
            .attr("fill", d => d.count > color7.domain()[1] / 2 ? "white" : "black")
            .text(d => d.count);
    }

    // --- Event Listeners and Filtering Logic ---
    function applyFilters() {
        const gender = document.getElementById('genderFilter').value;
        const age = +document.getElementById('ageFilter').value;
        const remote = document.getElementById('remoteFilter').value;

        filteredData = cleanData.filter(d => {
            const genderMatch = (gender === 'All') || (d.Gender === gender);
            const ageMatch = d.Age >= age;
            const remoteMatch = (remote === 'All') || (d.remote_work === remote);
            return genderMatch && ageMatch && remoteMatch;
        });

        d3.selectAll(".chart-container").transition().duration(250).style("opacity", 0.1)
          .end().then(() => {
            updateChart1(filteredData);
            updateChart2(filteredData);
            updateChart3(filteredData);
            updateChart4(filteredData);
            updateChart5(filteredData);
            updateChart6(filteredData);
            updateChart7(filteredData);
            d3.selectAll(".chart-container").transition().duration(250).style("opacity", 1);
        });
    }

    d3.select('#genderFilter').on('change', applyFilters);
    d3.select('#remoteFilter').on('change', applyFilters);
    d3.select('#ageFilter').on('input', function() {
        document.getElementById('ageValue').textContent = this.value;
        applyFilters();
    });

    // Initial chart render
    applyFilters();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        chart1Width = getInitialWidth('chart1-container');
        width1 = chart1Width - margin.left - margin.right;
        chart3Width = getInitialWidth('chart3-container');
        width3 = chart3Width - margin.left - margin.right;
        chart4Width = getInitialWidth('chart4-container');
        width4 = chart4Width - margin.left - margin.right;
        chart5Width = getInitialWidth('chart5-container');
        width5 = chart5Width - margin.left - margin.right;
        chart6Width = getInitialWidth('chart6-container');
        width6 = chart6Width - margin.left - margin.right;
        chart7Width = getInitialWidth('chart7-container');
        width7 = chart7Width - margin.left - margin.right;
        
        // Update chart 1
        d3.select("#chart1-container svg")
            .attr("width", chart1Width)
            .attr("viewBox", `0 0 ${chart1Width} ${height + margin.top + margin.bottom}`);
        x1.range([0, width1]);
        svg1.select(".x-axis").call(d3.axisBottom(x1));
        svg1.selectAll(".bar").attr("x", d => x1(d.gender)).attr("width", x1.bandwidth());
        svg1.select(".axis-label[text-anchor='middle']").attr("x", width1 / 2);
        svg1.select(".chart-title").attr("x", width1 / 2);
        
        // Update chart 2
        d3.select("#chart2-container svg")
            .attr("width", chart1Width)
            .attr("viewBox", `0 0 ${chart1Width} ${height + margin.top + margin.bottom}`);
        x2.range([0, width1]);
        svg2.select(".x-axis").call(d3.axisBottom(x2));
        updateChart2(filteredData);
        svg2.select(".axis-label[text-anchor='middle']").attr("x", width1 / 2);
        svg2.select(".chart-title").attr("x", width1 / 2);

        // Update chart 3
        d3.select("#chart3-container svg")
            .attr("width", chart3Width)
            .attr("viewBox", `0 0 ${chart3Width} ${height + margin.top + margin.bottom}`);
        x3Group.range([0, width3]);
        x3Subgroup.range([0, x3Group.bandwidth()]);
        svg3.select(".x-axis").call(d3.axisBottom(x3Group));
        updateChart3(filteredData);
        svg3.select(".axis-label[text-anchor='middle']").attr("x", width3 / 2);
        svg3.select(".chart-title").attr("x", width3 / 2);
        legend3.selectAll("rect").attr("x", width3 - 19);
        legend3.selectAll("text").attr("x", width3 - 24);

        // Update chart 4
        d3.select("#chart4-container svg")
            .attr("width", chart4Width)
            .attr("viewBox", `0 0 ${chart4Width} ${height + margin.top + margin.bottom}`);
        x4.range([0, width4]);
        svg4.select(".x-axis").call(d3.axisBottom(x4));
        updateChart4(filteredData);
        svg4.select(".axis-label[text-anchor='middle']").attr("x", width4 / 2);
        svg4.select(".chart-title").attr("x", width4 / 2);
        legend4.selectAll("rect").attr("x", 0);
        legend4.selectAll("text").attr("x", 24);

        // Update chart 5
        d3.select("#chart5-container svg")
            .attr("width", chart5Width)
            .attr("viewBox", `0 0 ${chart5Width} ${height + margin.top + margin.bottom}`);
        svg5.attr("transform", `translate(${chart5Width / 2},${(height + margin.top + margin.bottom) / 2})`);
        updateChart5(filteredData);
        svg5.select(".chart-title").attr("x", 0);
        legend5.selectAll("g").attr("transform", (d, i) => `translate(${width5 / 2 - 30},${-height / 2 + i * 20 + 20})`);

        // Update chart 6
        d3.select("#chart6-container svg")
            .attr("width", chart6Width)
            .attr("viewBox", `0 0 ${chart6Width} ${height + margin.top + margin.bottom}`);
        x6Group.range([0, width6]);
        x6Subgroup.range([0, x6Group.bandwidth()]);
        svg6.select(".x-axis").call(d3.axisBottom(x6Group));
        updateChart6(filteredData);
        svg6.select(".axis-label[text-anchor='middle']").attr("x", width6 / 2);
        svg6.select(".chart-title").attr("x", width6 / 2);
        legend6.selectAll("rect").attr("x", 0);
        legend6.selectAll("text").attr("x", 24);

        // Update chart 7
        d3.select("#chart7-container svg")
            .attr("width", chart7Width)
            .attr("viewBox", `0 0 ${chart7Width} ${height + margin.top + margin.bottom}`);
        x7.range([0, width7]);
        y7.range([height, 0]);
        svg7.select(".x-axis").call(d3.axisBottom(x7));
        svg7.select(".y-axis").call(d3.axisLeft(y7));
        updateChart7(filteredData);
        svg7.select(".axis-label[text-anchor='middle']").attr("x", width7 / 2);
        svg7.select(".chart-title").attr("x", width7 / 2);
    });

}).catch(error => {
    console.error("Error loading or parsing data:", error);
    d3.select("body").append("h2").style("color", "red").text("Failed to load data. Please check the console for errors.");
});