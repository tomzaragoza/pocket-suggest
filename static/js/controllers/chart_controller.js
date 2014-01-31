Prediket.ChartController = Ember.ObjectController.extend({
	actions: {
		loadChart: function() {
			
			var dataset = {
						labels : [1,2,3,4,5],
						data : [1,2,3,4,5]
					};


			var fillColour = "#009999";
			//rgb(151,187,205);

			var fillOpacity = 0.75;

			var target = "{{ data['target']|safe }}";
					
			var margin = {top: 30, right: 20, bottom: 40, left: 30};

			var height = 500 - margin.top - margin.bottom;
			
			var width = 750 - margin.left - margin.right;
			var sizeOfFont = 14;
					
			var barWidth = width / d3.max([7, dataset.labels.length]);
			
			var barPadding = 3;
			
			// To use a value dependent on Y, change this variable -->
			var minValueY = 0;
			
			// Variable to check if user has a bar selected.
				var clicked = false;


			// Data Y parsing.
			var dataY = [];
			for (var i=0; i < dataset.data.length; i++){
					dataY.push(d3.entries(dataset.data)[i].value);
			}

			// Date parsing.
			var dataX = [];
			console.log(dataset.labels);
			for (var k=0; k < dataset.data.length; k++){
					dataX.push(new Date(d3.entries(dataset.labels)[k].value));
			}

			var maxY = d3.max(dataY);

			console.log(dataX[0]);
			console.log(dataX[dataset.data.length - 1]);

			var xScale = d3.time.scale()
								.domain([dataX[0], dataX[dataset.data.length - 1]])
								.rangeRound([margin.left, width + margin.right]);
									
			var yScale = d3.scale.linear()
								.domain([0, maxY])
								.rangeRound([height, minValueY]);
									
			var xAxis = d3.svg.axis()
								.scale(xScale)
								.orient("bottom")
								.ticks(d3.time.days, 1)
								.tickFormat(d3.time.format('%b %d'));
									
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


			// Add text
			var text = svg.selectAll("text")
							.data(dataY)
							.enter()
						.append("text");

			// Add text attributes
			var textAttributes = text
					// Remember to change this for when there are less than 7 data points.
					.attr("x", function(d, i) { return (i * barWidth) + margin.left; })
					.attr("y", function(d) { return (yScale(d)) - 5; })
					.attr("dx", "0.15em")
					.text( function(d) {return d; })
					.attr("id", function(d, i) { var result = "text" + i; return result; })
					.attr("font-family", "cambria")
					.attr("font-size", sizeOfFont)
							.attr("fill", "black")
							.attr("class", "invisible");

				 
			// Create the bars for the graph   
			var bars = svg.selectAll("rect")
						.data(dataY)
						.enter()
						.append("rect");

			// Add bar attributes
				var barAttributes = bars
					.attr("x", function(d, i) { return (i * barWidth) + margin.left; })
					.attr("y", height)
					.attr("height", 0)
					.attr("width", barWidth - barPadding)
					.attr("fill", fillColour)
					.attr("opacity", fillOpacity)
					.on("mouseover", function(d, i) {
												d3.select(this).classed("highlight", true);

												d3.select("#text" + i)
													.classed("invisible", false);

											})
									.on("mouseout", function(d, i) {
														d3.select(this).classed("highlight", false);

														d3.select("#text" + i)
															.classed("invisible", true);
													})
						.on("click", function(d, i) {
							if (clicked !== false) {
								clicked.attr("opacity", fillOpacity)
										.attr("fill", fillColour);
							}

							d3.select(this).transition()
							.duration(100)
							.attr("fill", "#333366");

							d3.select(this).attr("opacity", 0.9);
							
							clicked = (d3.select(this));
					});

			bars.transition()
				.duration(function(d) { return 1500 + yScale(d); })
				.attr("y", function(d) { return (yScale(d)); })
				.attr("height", function(d) { return height - yScale(d); });


			svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + margin.left + ",0)")
				.call(yAxis);

			svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (height) + ")")
				.call(xAxis);
			}
	}
});