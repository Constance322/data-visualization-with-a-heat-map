const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

fetch(url)
  .then(response => response.json())
  .then(data => {
    const dataset = data.monthlyVariance;

    const margin = { top: 50, right: 50, bottom: 100, left: 100 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const baseTemperature = data.baseTemperature;
    const minYear = d3.min(dataset, d => d.year);
    const maxYear = d3.max(dataset, d => d.year);
    const numYears = maxYear - minYear + 1;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const xScale = d3.scaleBand()
                     .domain(d3.range(minYear, maxYear + 1))
                     .range([0, width]);

    const yScale = d3.scaleBand()
                     .domain(d3.range(1, 13))
                     .range([0, height]);

    const colorScale = d3.scaleLinear()
                         .domain(d3.extent(dataset, d => d.variance))
                         .range(["#2c7bb6", "#ffff8c", "#d7191c"])
                         .interpolate(d3.interpolateHcl);

    const xAxis = d3.axisBottom(xScale)
                    .tickValues(xScale.domain().filter(year => year % 10 === 0))
                    .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
                    .tickFormat(month => monthNames[month - 1]);

    const svg = d3.select("#heat-map")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".cell")
       .data(dataset)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("x", d => xScale(d.year))
       .attr("y", d => yScale(d.month))
       .attr("width", xScale.bandwidth())
       .attr("height", yScale.bandwidth())
       .attr("data-month", d => d.month)
       .attr("data-year", d => d.year)
       .attr("data-temp", d => baseTemperature + d.variance)
       .style("fill", d => colorScale(d.variance))
       .on("mouseover", function(d) {
         d3.select(this).style("stroke", "black");
         tooltip.transition()
                .duration(200)
                .style("opacity", .9);
         tooltip.html(`${monthNames[d.month - 1]} ${d.year}<br>${(baseTemperature + d.variance).toFixed(2)}&deg;C<br>${d.variance.toFixed(2)}&deg;C`)
                .attr("data-year", d.year)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
       })
       .on("mouseout", function() {
         d3.select(this).style("stroke", "none");
         tooltip.transition()
                .duration(500)
                .style("opacity", 0);
       });

    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", `translate(0,${height})`)
       .call(xAxis)
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("transform", "rotate(-45)");

    svg.append("g")
       .attr("id", "y-axis")
       .call(yAxis);

    const legendData = [2, 4, 6, 8, 10];
    const legendWidth = 400;
    const legendCellWidth = legendWidth / legendData.length;

    const legend = d3.select("#legend")
                     .html("<h3>Legend</h3>")
                     .append("svg")
                     .attr("width", legendWidth)
                     .attr("height", 30);

    legend.selectAll(".legend-cell")
          .data(legendData)
          .enter()
          .append("rect")
          .attr("class", "legend-cell")
          .attr("x", (d, i) => i * legendCellWidth)
          .attr("y", 0)
          .attr("width", legendCellWidth)
          .attr("height", 20)
          .style("fill", d => colorScale(d))
          .style("stroke", "none");
  });