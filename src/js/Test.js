async function createMap() {
    var projection = d3.geoAlbers();
    var width = 0;
    var height = 0;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }
    var mapSVG = d3.select('.map').attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform-origin", "center")
        .style("width", "100%")
        .style("height", "100%")
        .attr("class", "svg-content")
        .append("g").attr("class", "country-labels");

    zoom = d3.zoom()
        .scaleExtent([1, 8]) // set the scale extent as needed
        .on("zoom", () => {
            mapSVG.selectAll("g").attr("transform", d3.event.transform);
        });
    let color = d3.scaleQuantize()
        .range(["#edf8fb",
            "#b2e2e2",
            "#66c2a4",
            "#2ca25f",
            "#006d2c"
        ]);
    // Create drag behavior TODO: NOT WORKING
    drag = d3.drag()
        .on("drag", () => {
            console.log("dragging");
            const [x, y] = projection.invert([d3.event.x, d3.event.y]);
            projection.translate([d3.event.x, d3.event.y]);
        });
    mapSVG.call(zoom);
    mapSVG.call(drag);
    width = mapSVG.node().getBoundingClientRect().width - margin['left'] - margin['right'];
    height = mapSVG.node().getBoundingClientRect().height - margin['top'] - margin['bottom'];
    mapSVG.attr("viewBox", `0 0 ${width} ${height}`);
    // Map and projection
    var path = d3.geoPath().projection(projection);
    projection = projection
        .scale(Math.min(width, height) / 4)
        .translate([width / 2, height / 2]);

    let json = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    let csvData = await d3.csv("../extracted_data.csv");
    console.log(csvData); // To check what's actually loaded
    console.log(typeof csvData); // To check the type of csvData
    console.log(Array.isArray(csvData));
    color.domain([
        d3.min(csvData, function (d) {
            return d.value;
        }),
        d3.max(csvData, function (d) {
            return d.value;
        })
    ]);
    let dataCol = {};
    csvData.forEach(function (d) {
        dataCol[d['ISO Code']] = +d['Population'];
    });
    json.features.forEach(function (d) {
        d.value = dataCol[d.id];
    });
    d3.select("#mapLayer").selectAll("path")
        .data(json.features)
        .join("path")
        // here we use the familiar d attribute again to define the path
        .attr("d", path)
        .style("fill", function (d) {
            return color(d.properties.value);
        });
}
createMap();