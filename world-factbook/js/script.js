var width = 1000, height = 600;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

function drawTileMapGrid() {
    const width = 1000, height = 600;
    const tileSize = 20;
    var svg = d3.select("#map")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform-origin", "center")
        .style("width", width)
        .style("height", height)
        .style("background", "rgba(135,206,235, 0.6)")
        .append("g");

    d3.json("https://raw.githubusercontent.com/mustafasaifee42/Tile-Grid-Map/master/Tile-Grid-Map-Cleaned.json", function (world) {
        // Define scale factors
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(world, d => d.coordinates[0])])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(world, d => d.coordinates[1])])
            .range([0, height]);
        svg.selectAll(".country")
            .data(world)
            .enter()
            .append("rect")
            .attr("class", "country")
            .attr("x", d => xScale(d.coordinates[0]))
            .attr("y", d => yScale(d.coordinates[1]))
            .attr("width", tileSize)
            .attr("height", tileSize)
            .on("mouseover", function (d) {
                d3.select(this).style("fill", "orange");
            })
            .on("mouseout", function (d) {
                var ogColor = d3.select(this).attr("data-original-color");
                d3.select(this).style("fill", ogColor);
            })
        // .on("click", function (d) {
        //     console.log(d);
        // });
        svg.selectAll("text")
            .data(world)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.coordinates[0]) + tileSize / 2)
            .attr("y", d => yScale(d.coordinates[1]) + tileSize / 2)
            .attr("text-anchor", "middle")
            .text(d => d["alpha-2"]); // Display the alpha-2 code
    });

}

function drawMercator() {
    // Define path generator with initial projection
    var path = d3.geoPath().projection(d3.geoMercator());
    // Create SVG element
    var svg = d3.select("#map")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform-origin", "center")
        .style("width", "100%")
        .style("height", "100%")
        .style("background", "rgba(135,206,235, 0.6)")
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform);
        }))
        .append("g");

    var countries;
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function (world) {
        console.log(world);
        countries = svg.selectAll(".country")
            .data(world.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
        var tooltip = countries.append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .text("HELLO");
        countries
            .on("mouseover", function (d) {
                tooltip.style("visibility", "visible");
                d3.select(this).style("fill", "orange");
            })
            .on("mouseout", function (d) {
                tooltip.style("visibility", "hidden");
                var ogColor = d3.select(this).attr("data-original-color");
                d3.select(this).style("fill", ogColor);
            })

    });
}
d3.select("#projection-selector").on("change", function () {
    var selectedValue = d3.select(this).property("value");
    d3.select("#map").select("svg").remove();
    if (selectedValue === "tileMap") {
        drawTileMapGrid();
    } else {
        drawMercator();
    }



});
drawMercator();

function updateProjection() {
    countries.transition()
        .duration(750)
        .attr("d", path);
}

// Load CSV data
d3.csv("../data/extracted_data.csv", function (data) {
    // Extract columns for the selector
    var columns = Object.keys(data[0]);
    columns.forEach(function (column) {
        if (column === "ISO Code" || column === "Country") return;
        d3.select("#data-selector")
            .append("option")
            .text(column)
            .attr("value", column);
    });
    // Update function for selector
    d3.select("#data-selector").on("change", function () {
        var selectedColumn = d3.select(this).property("value");
        updateMap(selectedColumn, data);
    });
});

function updateMap(column, data) {
    // Create a map of country names/IDs to data values
    var dataMap = {};
    data.forEach(function (d) {
        dataMap[d['ISO Code']] = +d[column];
    });

    // Define a color scale for your data
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain(d3.extent(data, function (d) { return +d[column]; }));

    d3.select("#map").selectAll(".country")
        .on("click", function (d) {
            data.forEach(function (da) {
                if (da['ISO Code'] === d.id) {
                    window.open(da["url"]);
                }
            })
        });
    // Update the map colors based on the data
    d3.select("#map").selectAll(".country")
        .transition()
        .duration(500)
        .style("fill", function (d) {
            var color;
            if (dataMap[d.id]) {
                color = colorScale(dataMap[d.id]);
            } else if (dataMap[d['alpha-3']]) {
                color = colorScale(dataMap[d['alpha-3']]);
            } else {
                console.log("No data for: ", d);
                color = '#ccc';
            }
            d3.select(this).attr("data-original-color", color);
            return color;
        });
}
