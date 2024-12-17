const width = 1000;
const height = 600;
const margin = { top: 70, right: 50, bottom: 100, left: 90 };

async function fetchData() {
  const url = "./data.json"; // Path to the dataset
  const response = await fetch(url);

  if (!response.ok) {
    alert("HTTP-Error: " + response.status);
    return;
  }

  const data = await response.json();
  setupInteractions(data);
  drawChart(
    data.chart.selection,
    data.columns["GHG emissions of milks (kg CO2eq)"].titleShort,
    "GHG emissions of milks (kg CO2eq)",
    data
  );
}

function setupInteractions(data) {
  const selector = document.getElementById("metric-selector");
  selector.addEventListener("change", function () {
    const selectedMetric = selector.value;
    const metricTitle = data.columns[selectedMetric].titleShort;
    drawChart(data.chart.selection, metricTitle, selectedMetric, data);
  });
}

function drawChart(types, metricTitle, metricKey, data) {
  const container = document.getElementById("container");
  container.innerHTML = ""; // Clear existing content

  const metricData = data.columns[metricKey];
  const unit = metricData.unit; // Fetch the unit
  const dataset = types.map(type => ({
    type,
    value: metricData.values[type] // Extract values by milk type
  }));

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height);

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(dataset.map(d => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("color", "#000")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.3)")
    .style("display", "none");

  // Add Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#fff")
    .style("font-family", "'Roboto Mono', monospace");

  const yAxis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px")
    .style("fill", "#fff")
    .style("font-family", "'Roboto Mono', monospace");

  // Add Y-Axis Label with Unit
  svg
    .append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", margin.left - 60) // Position it slightly away from the y-axis
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-size", "16px")
    .style("font-family", "'Roboto Mono', monospace")
    .text(unit);

  // Bars
  svg
    .selectAll(".bar")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.type))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d.value))
    .attr("fill", "white")
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.type}</strong><br>${metricTitle}: ${d.value}`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Labels
  svg
    .selectAll(".label")
    .data(dataset)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.value) - 5)
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-size", "14px")
    .style("font-family", "'Roboto Mono', monospace")
    .text(d => d.value);

  container.append(svg.node());
}

fetchData();