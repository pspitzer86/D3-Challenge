// In collaboration with Kate Spitzer


// function used for updating x scale var upon click on axis label

function xScale(censusData, chosenXAxis) {

	// create scales

	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(censusData, d => d[chosenXAxis]) * 0.95,
		d3.max(censusData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

	return xLinearScale;
}


// function used for updating y scale var upon click on axis label

function yScale(censusData, chosenYAxis) {

	// create scales

	var yLinearScale = d3.scaleLinear()
		.domain([0, d3.max(censusData, d => d[chosenYAxis]) * 1.05])
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

function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

	circlesGroup.transition()
	  .duration(1000)
	  .attr("cx", d => newXScale(d[chosenXAxis]));
  
	return circlesGroup;
}

// function used for updating circles group in y axis with a transition to
// new circles

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

	circlesGroup.transition()
	  .duration(1000)
	  .attr("cy", d => newYScale(d[chosenYAxis]));
  
	return circlesGroup;
}

// function used for updating circles group in x axis with a transition to
// new circles

function renderXText(circleLabels, newXScale, chosenXAxis) {

	circleLabels.transition()
	  .duration(1000)
	  .attr("x", d => newXScale(d[chosenXAxis]));
  
	return circleLabels;
}

// function used for updating circles group in y axis with a transition to
// new circles

function renderYText(circleLabels, newYScale, chosenYAxis) {

	circleLabels.transition()
	  .duration(1000)
	  .attr("y", d => newYScale(d[chosenYAxis]));
  
	return circleLabels;
}
  
// function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
	var xlabel;
	var ylabel;

	var xunits;
	var yunits;
  
	// set x axis label and units

	switch (chosenXAxis) {

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
  
	// set y axis label and units

	switch (chosenYAxis) {

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
  
	// create event listener for mouseover and
	// mouseout on circles

	circlesGroup.on("mouseover", function(data) {
		toolTip.show(data);
	})
	.on("mouseout", function(data, index) {
		toolTip.hide(data);
	});

	return circlesGroup;
}


// set size of entire chart area

var svgWidth = 1500;
var svgHeight = 800;


// define margins around chart

var margin = {
	top: 20,
	right: 40,
	bottom: 100,
	left: 120
};


// calculate dimensions of the actual chart

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// append an SVG group that will hold our chart,
// and shift the chart by left and top margins

var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);


// append a group for our chart

var chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

// initialize default x and y axis values

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
	

// read dataset in from CSV file

d3.csv("./assets/data/data.csv").then(function(censusData) {

	// parse data and convert to numeric

	censusData.forEach(function(data) {
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.income = +data.income;
		data.healthcare = +data.healthcare;
		data.obesity = +data.obesity;
		data.smokes = +data.smokes;
	});

	// create linear scale functions

	var xLinearScale = xScale(censusData, chosenXAxis);
	var yLinearScale = yScale(censusData, chosenYAxis);

	// create initial axis functions

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
	
	// set radius of circles

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

	// create group for state abbreviations
	// source: https://stackoverflow.com/questions/55988709/how-can-i-add-labels-inside-the-points-in-a-scatterplot
	// thank you annette broeren and kevin mickey

	var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

	// add labels for circles

	circleLabels
		.classed("stateText", true)
		.attr("x", d=> xLinearScale(d[chosenXAxis]))
		.attr("y", d=> yLinearScale(d[chosenYAxis]))
		.attr("dy", "0.4em")
		.style("font-size", radius*0.8)
		.text(d => d.abbr);

	// create group for x axis labels

  	var xlabelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${width / 2}, ${height + 20})`);

	// create groups for y axis labels

	var ylabelsGroup = chartGroup.append("g")
		.attr("transform", "rotate(-90)");	

	// create a label for each x axis dataset
	// and set the default to active

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

	// create a label for each y axis dataset
	// and set the default to active

	var healthcareLabel = ylabelsGroup.append("text")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("value", "healthcare") // value to grab for event listener
		.attr("dy", "5.5em")
		.classed("active", true)
		.classed("aText", true)
		.text("Lacks Healthcare (%)");

	var smokesLabel = ylabelsGroup.append("text")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("value", "smokes") // value to grab for event listener
		.attr("dy", "4.2em")
		.classed("inactive", true)
		.classed("aText", true)
		.text("Smokes (%)");
	
	var obesityLabel = ylabelsGroup.append("text")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("value", "obesity") // value to grab for event listener
		.attr("dy", "2.9em")
		.classed("inactive", true)
		.classed("aText", true)
		.text("Obesity (%)");
		
	// initialize tooltip

	var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

	// x axis labels event listener

	xlabelsGroup.selectAll("text")
  		.on("click", function() {

			// get value of selection

			var value = d3.select(this).attr("value");

			// only need to change the x axis if the
			// value has changed

			if (value !== chosenXAxis) {

	  			// replaces chosenXAxis with current value

	  			chosenXAxis = value;

				// updates x scale for new data

				xLinearScale = xScale(censusData, chosenXAxis);

	  			// updates x axis with transition

	  			xAxis = renderXAxis(xLinearScale, xAxis);

	  			// updates circles with new x values

	  			circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

				// updates circles with new x values

				circleLabels = renderXText(circleLabels, xLinearScale, chosenXAxis);

	  			// updates tooltips with new info

	  			circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

	  			// changes x axis classes to change bold text

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

			// only need to change the y axis if the
			// value has changed

	  		if (value !== chosenYAxis) {

				// replaces chosenXAxis with value

				chosenYAxis = value;

		  		// functions here found above csv import
		  		// updates y scale for new data

		  		yLinearScale = yScale(censusData, chosenYAxis);

				// updates y axis with transition

				yAxis = renderYAxis(yLinearScale, yAxis);

				// updates circles with new y values

				circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
					
				// updates circles with new x values

				circleLabels = renderYText(circleLabels, yLinearScale, chosenYAxis);

				// updates tooltips with new info

				circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

				// changes classes to change bold text

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