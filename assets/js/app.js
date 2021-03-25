// function used for updating x-scale var upon click on axis label

function xScale(censusData, chosenXAxis) {

  // create x scales

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.95,
      d3.max(censusData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(censusData, chosenYAxis) {

    // create y scales

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d[chosenYAxis]) * 1.05
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label

function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group in x axis with a transition to
// new circles

function renderXaxisCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group in y axis with a transition to
// new circles
function renderYaxisCircles(circlesGroup, newYScale, chosenYAxis)  {

    circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used to updating circles group in x axis with a transition to
// new circles
function renderXaxisText(circleLabels, newXScale, chosenXAxis) {

    circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

    return circleLabels;
}

// function used for updating circles group in y axis with a transition to
// new circles
function renderYaxisText(circleLabels, newYScale, chosenYAxis) {

    circleLabels.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

    return circleLabels;
}

// function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // creating variables to help create axes

  var xlabel;
  var ylabel;

  var xunits;
  var yunits;

  // set x axis

  switch(chosenXAxis) {
      case "poverty":
          xlabel = "Poverty: ";
          xunits = "%";
          break;
      case "age":
          xlabel = "Median Age: ";
          xunits = "";
          break;
      case "income":
          xlabel = "Median Income: $";
          xunits = "";
  }

  // set y axis 

  switch(chosenYAxis) {
      case "healthcare":
          ylabel = "Lacks Healthcare: ";
          yunits = "%";
          break;
      case "smokes":
          ylabel = "Smokes: ";
          yunits = "%";
          break;
      case "obesity":
          ylabel = "Obesity: ";
          yunits = "%";
  }

  // create tooltip function

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}${d[chosenXAxis]}${xunits}<br>${ylabel}${d[chosenYAxis]}${yunits}`);
    });

  // create tooltips

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    })

    // onmouseout event

    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// set chart size

var svgWidth = 1300;
var svgHeight = 750;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the chart,
// and shift the latter by left and top margins.

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// Retrieve data from the CSV file and execute everything below

d3.csv("./assets/data/data.csv").then(function(censusData) {

  // parse data

  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  // Create linear scale from functions

  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis

  var xAxis = chartGroup.append("g")
    .classed("chart", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis

  var yAxis = chartGroup.append("g")
  .call(leftAxis);

  // set circle radius

  var radius = 15;

  // append initial circles

  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", radius);

  // state abbreviation creation

  var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

  // add abbreviation labels in circles

  circleLabels
     .classed("stateText", true)
     .attr("x", d => xLinearScale(d[chosenXAxis]))
     .attr("y", d => yLinearScale(d[chosenYAxis]))
     .attr("dy", "0.4em")
     .style("font-size", radius*0.8)
     .text(d => d.abbr);

  // Create group for x-axis labels

  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Create group for y-axis labels

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  // create label for each x-axis dataset
  // set chosen initial to active

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Household Income (Median)");

  // create label for each y-axis dataset
  // set chosen initial to active

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("value", "healthcare") // value to grab for event listener
    .attr("dy", "5.5em")
    .classed("active", true)
    .classed("aText", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("value", "smokes") // value to grab for event listener
    .attr("dy", "4.2em")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("value", "obesity") // value to grab for event listener
    .attr("dy", "2.9em")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Obesity (%)");

  // updateToolTip function for current axes

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

  // x axis labels event listener

  xlabelsGroup.selectAll("text")
    .on("click", function() {

      // get value of selection

      var value = d3.select(this).attr("value");

      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value

        chosenXAxis = value;

        // updates x scale for new data

        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition

        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values

        circlesGroup = renderXaxisCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates circles with new x values

        circleLabels = renderXaxisText(circleLabels, xLinearScale, chosenXAxis);

        // updates tooltips with new info

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes x-axis classes to change bold text

        switch(chosenXAxis) {
            case "poverty":
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                break;

            case "age":
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                break;

            case "income":
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
        
        }
      }
    });

  // y axis labels event listener

  ylabelsGroup.selectAll("text")
    .on("click", function() {

      // get value of selection

      var value = d3.select(this).attr("value");

      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value

        chosenYAxis = value;

        // updates y scale for new data

        yLinearScale = yScale(censusData, chosenYAxis);

        // updates y axis with transition

        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values

        circlesGroup = renderYaxisCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates circles with new y values

        circleLabels = renderYaxisText(circleLabels, yLinearScale, chosenYAxis);

        // updates tooltips with new info

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes x-axis classes to change bold text

        switch(chosenYAxis) {

            case "healthcare":
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                break;

            case "smokes":
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                break;
                
            case "obesity":
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
        
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
