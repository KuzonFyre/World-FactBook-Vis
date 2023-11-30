var width = 800, height = 500;

        // Create SVG element
        var svg = d3.select("#map")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

        // Define map projection
        var projection = d3.geoMercator()
                           .translate([width / 2, height / 1.5])
                           .scale(100);

        // Define path generator
        var path = d3.geoPath()
                     .projection(projection);

        // Load and display the World
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",function(world) {
            svg.selectAll(".country")
               .data(world.features)
               .enter()
               .append("path")
               .attr("class", "country")
               .attr("d", path);
        });

        // Load CSV data
        d3.csv("../extracted_data.csv", function(data) {
            // Extract columns for the selector
            var columns = Object.keys(data[0]);
            columns.forEach(function(column) {
                d3.select("#data-selector")
                  .append("option")
                  .text(column)
                  .attr("value", column);
            });

            // Update function for selector
            d3.select("#data-selector").on("change", function() {
                var selectedColumn = d3.select(this).property("value");
                updateMap(selectedColumn, data);
            });
        });

        function updateMap(column, data) {
            console.log(column);
            console.log(data);
            // Create a map of country names/IDs to data values
            var dataMap = {};
            data.forEach(function(d) {
                dataMap[d['ISO Code']] = +d[column];
            });
        
            // Define a color scale for your data
            var colorScale = d3.scaleSequential(d3.interpolateBlues)
                               .domain(d3.extent(data, function(d) { return +d[column]; }));
        
            // Update the map colors based on the data
            svg.selectAll(".country")
               .transition()
               .duration(500)
               .style("fill", function(d) {
                    console.log(d);
                   return dataMap[d.id] ? colorScale(dataMap[d.id]) : '#ccc';
               });
        
            // Optionally, you can add tooltips or other interactive elements here
        }
        