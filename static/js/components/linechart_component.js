Prediket.LineChartComponent = Ember.Component.extend({
	tagName: 'svg',

	didInsertElement: function() {

		Ember.$.getJSON('/stream/my_new_stream_lol').then(function(retrieveData) {

			
		// $.get('/stream/my_new_stream_lol', function(retrieveData){
								console.log("within the call yo");
								console.log(retrieveData);
								console.log(retrieveData.labels);
								console.log(retrieveData.labels.length);
								
								console.log(retrieveData.data);
								console.log(retrieveData.data.length);
								// return response;
							//});

		console.log("HERE IS THE RETRIEVED DATA");
		console.log(retrieveData.labels);
		console.log(retrieveData.data);
		console.log("ANYTHING ABOVE?");
		var dataset = {
				labels : retrieveData.labels, //[1,2,3,4,5,6,7,8,9],
				data : retrieveData.data//[1,2,3,4,5,6,7,8,9]
			};

		console.log("HERE IS THE RETRIEVED DATA 2");
		console.log(retrieveData.data);
		console.log(retrieveData.labels);
		console.log("ANYTHING ABOVE? 2");

		var fillColour = "#009999";
		//rgb(151,187,205);

		var fillOpacity = 0.75;

		var margin = {top: 30, right: 20, bottom: 20, left: 30};

		var height = 500 - margin.top - margin.bottom;

		var width = 750 - margin.left - margin.right;
		var sizeOfFont = 14;
				
		var barWidth = width / dataset.labels.length;
		
		var barPadding = 3;
		
		// To use a value dependent on Y, change this variable -->
		var minValueY = 0;
		
		// Variable to check if user has a bar selected
		var clicked = false;


		// Probably very inneficient. Change when Im in a better mood -->
		var dataY = [];
		for (var i=0; i < dataset.data.length; i++){
				dataY.push(d3.entries(dataset.data)[i].value);
		}

		var maxY = d3.max(dataY);


		var xScale = d3.time.scale()
								.domain([0, dataset.labels.length - 1])
								.rangeRound([margin.left, width]);
								
		var yScale = d3.scale.linear()
								.domain([0, maxY])
								.rangeRound([height, minValueY]);
								
		var xAxis = d3.svg.axis()
								.scale(xScale)
								.orient("bottom");
								
		var yAxis = d3.svg.axis()
								.scale(yScale)
								.ticks(10)
								.orient("left");


		// Create the SVG Viewport
		var id = this.$().attr('id');
		var svg = d3.select("#"+id)
							.append("svg")
							.attr("width", width + margin.left + margin.right)
										.attr("height", height + margin.top + margin.bottom)
								.on("click", function(d) { if (clicked !== false) {
											clicked.attr("opacity", fillOpacity)
											.attr("fill", fillColour);
											}})
										.append("g")
											.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Add the line
		var line = d3.svg.line()
							.x(function(d, i)  { return xScale(i); })
							.y(function(d) { return yScale(d) ; })
				.interpolate("cardinal")
				.tension(0.9);

		// Add text
		var text = svg.selectAll("text")
				.data(dataY)
				.enter()
				.append("text");

		// Add text attributes
		var textAttributes = text
				.attr("x", function(d, i) { return (i * barWidth) + margin.left; })
				.attr("y", function(d) { return (yScale(d)) - 5; })
				.attr("dx", "0.15em")
				.text( function(d) {return d; })
				.attr("id", function(d, i) { var result = "text" + i; return result; })
				.attr("font-family", "cambria")
				.attr("font-size", sizeOfFont)
				.attr("fill", "black")
				.attr("class", "invisible");


		var path = svg.append("path")
			.attr("fill", "none")
			.attr("stroke-width", 2)
			.attr("stroke", "black")
			.attr("d", line(dataY));

		var totalLength = path.node().getTotalLength();

		path.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);

		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(yAxis);
		
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (height) + ")")
			.call(xAxis);

		console.log("LAST CHANCE");
		console.log(retrieveData);
		});
	}
});