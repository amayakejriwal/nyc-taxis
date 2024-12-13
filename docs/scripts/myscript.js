// Set up dimensions and margins
const margin = { top: 50, right: 30, bottom: 50, left: 50 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append an SVG element to the plot div
const svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Add a title
svg.append("text")
  .attr("x", width / 2 + margin.left)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .text("Tip Percentage vs Trip Distance in Different Boroughs");

// Create a group for the plot area
const plotGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add a tooltip div
const tooltip = d3.select("#plot")
  .append("div")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #ccc")
  .style("padding", "5px")
  .style("font-size", "12px")
  .style("pointer-events", "none");

// Add a container for checkboxes
const checkboxContainer = d3.select("#plot")
  .append("div")
  .attr("id", "checkbox-container")
  .style("margin-top", "20px");

// Load the CSV file
const csvUrl = "https://raw.githubusercontent.com/amayakejriwal/nyc-taxis/main/tips_sample2.csv";

d3.csv(csvUrl).then(data => {
  data.forEach(d => {
    d.trip_distance = +d.trip_distance;
    d.percent_tip = +d.percent_tip;
  });

  // Define scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.trip_distance)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.percent_tip)])
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain([...new Set(data.map(d => d.DOBorough))]); // Get unique boroughs

  // Add axes
  plotGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .text("Trip Distance (miles)");

  plotGroup.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("fill", "black")
    .text("Tip Percentage (%)");

  // Draw all circles initially
  const circles = plotGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.trip_distance))
    .attr("cy", d => y(d.percent_tip))
    .attr("r", 5)
    .attr("fill", d => color(d.DOBorough))
    .attr("class", d => `borough-${d.DOBorough.replace(/\s+/g, "-")}`) // Add class for toggling
    .style("opacity", 0.7) // Add transparency
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `Borough: ${d.DOBorough}<br>
           Trip Distance: ${d.trip_distance} miles<br>
           Tip: ${d.percent_tip.toFixed(2)}%`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Add checkboxes
  const boroughs = color.domain();
  boroughs.forEach(borough => {
    const checkboxId = `checkbox-${borough.replace(/\s+/g, "-")}`;
    const boroughColor = color(borough);

    const label = checkboxContainer
      .append("label")
      .style("display", "inline-block")
      .style("margin-right", "15px");

    label
      .append("input")
      .attr("type", "checkbox")
      .attr("value", borough)
      .attr("id", checkboxId)
      .property("checked", true)
      .on("change", () => {
        const isChecked = d3.select(`#${checkboxId}`).property("checked");
        const boroughClass = `.borough-${borough.replace(/\s+/g, "-")}`;
        plotGroup.selectAll(boroughClass).style("opacity", isChecked ? 0.7 : 0);
      });

    label
      .append("span")
      .style("background-color", boroughColor)
      .style("display", "inline-block")
      .style("width", "12px")
      .style("height", "12px")
      .style("margin-right", "5px")
      .style("vertical-align", "middle");

    label
      .append("span")
      .text(borough)
      .style("vertical-align", "middle");
  });
});