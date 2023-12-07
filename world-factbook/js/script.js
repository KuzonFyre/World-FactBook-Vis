

function drawTileMapGrid() {
    var svg = d3.select("#map")
        .append("svg")
        .style("width", "100%")
        .style("height", "100%")
        .style("background", "rgba(135,206,235, 0.6)")
        .append("g");

}
function drawMercator(trade) {
    // Define path generator with initial projection
    var path = d3.geoPath().projection(d3.geoMercator());
    // Create SVG element
    var svg = d3.select("#map")
        .append("svg")
        .style("background", "rgba(135,206,235, 0.6)")
        .style("width", "100%")
        .style("height", "100%")
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform);
        }))
        .append("g");

    var countries;
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function (world) {
        countries = svg.selectAll(".country")
            .data(world.features)
            .enter()
            .append("path")
            .attr("class", d => "country " + d.id)
            .attr("d", path)
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");
        if (trade === "imports") drawTradeLinks(svg, world, true);
        if (trade === "exports") drawTradeLinks(svg, world, false);
        countries
            .on("mouseover", function (d) {
                tooltip.html("Country Name: " + d.properties.name) // Example content
                    .style("visibility", "visible");
                d3.select(this).style("fill", "blue");
                if (trade === "imports" || trade === "exports") {
                    console.log(d.id)
                    d3.select("#map").selectAll(`.trade-link.${d.id}`)
                        .style("opacity", 1)
                }
            })
            .on("mousemove", function () {
                tooltip.style("top", (d3.event.pageY - 10) + "px")
                    .style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.style("visibility", "hidden");
                var ogColor = d3.select(this).attr("data-original-color");
                d3.select(this).style("fill", ogColor);
                if (trade === "imports" || trade === "exports") {
                    d3.select("#map").selectAll(".trade-link")
                        .style("opacity", 0)
                }
            });

    });

}
function drawFancyTrade() {
    d3.json("../data/trade_data.json", function (data) {

        d3.json('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson', function (countries) {
            const links = data.map(function (link) {
                const sourceCountry = countries.features.find(d => d.properties.ISO_A3 === link.source);
                const targetCountry = countries.features.find(d => d.properties.ISO_A3 === link.target);
                if (!sourceCountry || !targetCountry) return null;
                return {
                    startLat: d3.geoCentroid(sourceCountry)[0],
                    startLang: d3.geoCentroid(sourceCountry)[1],
                    endLat: d3.geoCentroid(targetCountry)[0],
                    endLang: d3.geoCentroid(targetCountry)[1],
                    color: link.source
                }
            }).filter(d => d !== null);
            console.log(links)
            Globe()
                .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
                .arcsData(links)
                .arcColor('color')
                .arcDashLength(() => Math.random())
                .arcDashGap(() => Math.random())
                .arcDashAnimateTime(() => Math.random() * 4000 + 500)
                (document.getElementById('map'))
        })
    })

}
function drawFancy(selectedColumn) {
    d3.csv("../data/extracted_data.csv", function (data) {
        d3.json('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson', function (countries) {
            const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
                .domain(d3.extent(data, function (d) { return +d[selectedColumn]; }));
            const world = Globe()
                .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
                .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
                .lineHoverPrecision(0)
                .polygonsData(countries.features)
                .polygonAltitude(0.06)
                .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
                .polygonStrokeColor(() => '#111')
                .polygonLabel(({ properties: d }) => `
            <b>${d.ADMIN} (${d.ISO_A3}):</b>
          `)
                .polygonCapColor(d => {
                    const entry = data.find(da => da['ISO Code'] === d.properties['ISO_A3'])
                    return entry ? colorScale(entry[selectedColumn]) : 'gray';
                })
                .onPolygonHover(hoverD => world
                    .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
                    .polygonCapColor(p => {
                        const entry = data.find(da => da['ISO Code'] === p.properties['ISO_A3'])
                        if (entry) {
                            return p === hoverD ? 'steelblue' : colorScale(entry[selectedColumn])
                        }
                    })
                )
                .polygonsTransitionDuration(300)
                (document.getElementById('map'))
        })
    });
}

d3.select("#projection-selector").on("change", function () {
    var selectedValue = d3.select(this).property("value");
    d3.select("#map").select("svg").remove();
    d3.select("#map").select("div").remove();
    if (selectedValue === "tileMap") {
        drawTileMapGrid();
    } else if (selectedValue === "mercator") {
        drawMercator("");
    } else if (selectedValue === "exportTradeMap") {
        drawMercator("exports");
    } else if (selectedValue === "importTradeMap") {
        drawMercator("imports");
    } else if (selectedValue === "fancy") {
        world = drawFancy();
    } else if (selectedValue === "fancyTrade") {
        world = drawFancyTrade();
    }
});
drawMercator("");

function drawTradeLinks(svg, world, isImport) {
    // Load CSV data
    var dataPath;
    if (isImport) dataPath = "../data/import_data.json";
    else dataPath = "../data/export_data.json";
    d3.json(dataPath, function (data) {
        const projection = d3.geoMercator();
        const pathGenerator = d3.geoPath().projection(projection);
        console.log(data);
        console.log(d3.geoCentroid(data[0].source));
        const links = data.map(function (link) {
            const sourceCountry = world.features.find(d => d.id === link.source);
            const targetCountry = world.features.find(d => d.id === link.target);
            if (!sourceCountry || !targetCountry) return null;
            return {
                source: link.source,
                target: link.target,
                sourceXY: projection(d3.geoCentroid(sourceCountry)),
                targetXY: projection(d3.geoCentroid(targetCountry)),
                value: link.value
            }
        }
        ).filter(d => d !== null);
        var widthScale = d3.scaleLinear()
            .domain(d3.extent(links, d => d.value))
            .range([1, 10]);
        svg.selectAll('.trade-link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', function (d) { return `trade-link ${d.source}` })
            .attr('x1', function (d) { return d.sourceXY[0]; })
            .attr('y1', function (d) { return d.sourceXY[1]; })
            .attr('x2', function (d) { return d.targetXY[0]; })
            .attr('y2', function (d) { return d.targetXY[1]; })
            .attr('stroke-width', d => widthScale(d.value))
            .attr('stroke', 'black')
            .style("opacity", 0)
    });
}

d3.select("#scatterPlot")
    .append("svg")
    .style("background", "rgba(135,206,235, 0.6)")
    .style("width", "100%")
    .style("height", "100%")

function updateScatterPlot(s1, s2, data) {

    d3.select("#scatterPlot").select("svg").selectAll("*").remove();
    var svg = d3.select("#scatterPlot").select("svg")
    var margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const container = svg.node();
    const width = parseInt(container.getBoundingClientRect().width) - margin.right - margin.left;
    const height = parseInt(container.getBoundingClientRect().height) - margin.top - margin.bottom;
    console.log(width, height)
    const dScatter = data.filter(d => d[s1] !== "" && d[s2] !== "" && d[s1] !== "nan" && d[s2] !== "nan")
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d[s1]; }))
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d[s2]; }))
        .range([height, 0]);
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));
    g.selectAll(".dot")
        .data(dScatter)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return x(d[s1]); })
        .attr("cy", function (d) { return y(d[s2]); })
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .on("mouseover", function (d) {
            d3.select(this).style("fill", "blue")
                .style("stroke", "black")
            d3.select("#map").selectAll(".country")
                .style("opacity", 0.5)
            d3.select("#map").selectAll(".country." + d["ISO Code"])
                .style("opacity", 1)
                .style("fill", "blue")
                .style("stroke", "black")
                .style("stroke-width", "1px")
            tooltip.html("Country Name: " + d["Country"] + "<br/>" + s1 + ": " + d[s1] + "<br/>" + s2 + ": " + d[s2])
                .style("visibility", "visible");
        }).on("mouseout", function (d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("fill", "#69b3a2")
                .style("stroke", "none")
            d3.select("#map").selectAll(".country")
                .style("opacity", 1)
            d3.select("#map").selectAll(".country." + d["ISO Code"])
                .style("fill", d3.select("#map").selectAll(".country." + d["ISO Code"]).attr("data-original-color"))
                .style("stroke", "none")
        })
        .on("mousemove", function () {
            tooltip.style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })

}
d3.csv("../data/extracted_data.csv", function (data) {
    // Extract columns for the selector
    var columns = Object.keys(data[0]);
    columns.forEach(function (column) {
        if (column === "ISO Code" || column === "Country" || column === "url") return;
        d3.select("#data-selector")
            .append("option")
            .text(column)
            .attr("value", column);
        d3.select("#scatter-selector1")
            .append("option")
            .text(column)
            .attr("value", column);
        d3.select("#scatter-selector2")
            .append("option")
            .text(column)
            .attr("value", column);
    });

    d3.select("#scatter-selector1").on("change", function () {
        var selectedColumn = d3.select(this).property("value");
        updateScatterPlot(selectedColumn, d3.select("#scatter-selector2").property("value"), data);
    });
    d3.select("#scatter-selector2").on("change", function () {
        var selectedColumn = d3.select(this).property("value");
        updateScatterPlot(d3.select("#scatter-selector1").property("value"), selectedColumn, data);
    });
    // Update function for selector
    d3.select("#data-selector").on("change", function () {
        var selectedColumn = d3.select(this).property("value");
        var selectedMap = d3.select('#projection-selector').property("value");
        if (selectedMap === "fancy") {
            drawFancy(selectedColumn);
        } else if (selectedMap === "tileMap") {
            updateTileMap(selectedColumn, data);
        } else {
            updateMap(selectedColumn, data);
        }
    });
});
function updateTileMap(column, data) {
    const tileSize = 10;
    var svg = d3.select("#map").select("svg");
    const container = svg.node();
    const width = container.getBoundingClientRect().width;
    const height = container.getBoundingClientRect().height;
    d3.json("https://raw.githubusercontent.com/mustafasaifee42/Tile-Grid-Map/master/Tile-Grid-Map-Cleaned.json", function (world) {
        // Define scale factors
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(world, d => d.coordinates[0])])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(world, d => d.coordinates[1])])
            .range([0, height]);
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");
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
                console.log(d);
                tooltip.html("Tile Info: " + d.name) // Replace with appropriate content
                    .style("visibility", "visible");
                d3.select(this).style("fill", "blue");
            })
            .on("mousemove", function () {
                tooltip.style("top", (d3.event.pageY - 10) + "px")
                    .style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.style("visibility", "hidden");
                d3.select(this).style("fill", d3.select(this).attr("data-original-color"));
            });
    });
    updateMap(column, data);
}
function updateMap(column, data) {
    console.log("Updating map with column: ", column);
    // Create a map of country names/IDs to data values
    var dataMap = {};
    data.forEach(function (d) {
        dataMap[d['ISO Code']] = +d[column];
    });

    // Define a color scale for your data
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain(d3.extent(data, function (d) { return +d[column]; }));
    console.log(d3.select('#map'))
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
