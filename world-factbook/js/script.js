
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

function drawTileMapGrid() {

    const tileSize = 20;
    var svg = d3.select("#map")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform-origin", "center")
        .style("width", "100%")
        .style("height", "auto")
        .style("background", "rgba(135,206,235, 0.6)")
        .append("g");
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
        console.log(world);
        countries = svg.selectAll(".country")
            .data(world.features)
            .enter()
            .append("path")
            .attr("class", d => "country " + d.id)
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
        if (trade) drawTradeLinks(svg, world)
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
            <b>${d.ADMIN} (${d.ISO_A3}):</b> <br />: <i></i><br/>
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
        drawMercator(false);
    } else if (selectedValue === "tradeMap") {
        drawMercator(true);
    } else if (selectedValue === "fancy") {
        world = drawFancy();
    } else if (selectedValue === "fancyTrade") {
        world = drawFancyTrade();
    }
});
drawMercator(false);

function drawTradeLinks(svg, world) {
    console.log(world)
    // Load CSV data
    d3.json("../data/trade_data.json", function (data) {
        const projection = d3.geoMercator();
        const pathGenerator = d3.geoPath().projection(projection);
        console.log(data);
        console.log(d3.geoCentroid(data[0].source));
        const links = data.map(function (link) {
            const sourceCountry = world.features.find(d => d.id === link.source);
            const targetCountry = world.features.find(d => d.id === link.target);
            if (!sourceCountry || !targetCountry) return null;
            return {
                source: projection(d3.geoCentroid(sourceCountry)),
                target: projection(d3.geoCentroid(targetCountry)),
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
            .attr('class', 'trade-link')
            .attr('x1', function (d) { return d.source[0]; })
            .attr('y1', function (d) { return d.source[1]; })
            .attr('x2', function (d) { return d.target[0]; })
            .attr('y2', function (d) { return d.target[1]; })
            .attr('stroke-width', d => widthScale(d.value))
            .attr('stroke', 'black');

    });
}
d3.select("#scatterPlot")
    .append("svg")
    .style("background", "rgba(135,206,235, 0.6)")
    .style("width", "100%")
    .style("height", "100%")

function updateScatterPlot(s1, s2, data) {
    d3.select("#scatterPlot").select("svg").selectAll("g").remove();
    var svg = d3.select("#scatterPlot").select("svg")
    const container = svg.node();
    const width = container.getBoundingClientRect().width;
    const height = container.getBoundingClientRect().height;
    console.log(width, height)

    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d[s1]; }))
        .range([20,width-20]);
    var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d[s2]; }))
        .range([height-20,20]);
    svg.append("g")
        .selectAll("dot")
        .data(data.filter(d => d[s1] !== "" && d[s2] !== ""))
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return x(d[s1]); })
        .attr("cy", function (d) { return y(d[s2]); })
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .on("mouseover", function (d) {
            d3.select(this).style("fill", "orange")
                .style("stroke", "black")
                .style("stroke-width", "1px")
            d3.select("#map").selectAll(".country")
                .style("opacity", 0.5)
            d3.select("#map").selectAll(".country." + d["ISO Code"])
                .style("opacity", 1)
                .style("fill", "orange")
                .style("stroke", "black")
                .style("stroke-width", "1px")
        }).on("mouseout", function (d) {
            d3.select(this).style("fill", "#69b3a2")
                .style("stroke", "none")
            d3.select("#map").selectAll(".country")
                .style("opacity", 1)
            d3.select("#map").selectAll(".country." + d["ISO Code"])
                .style("fill", d3.select("#map").selectAll(".country." + d["ISO Code"]).attr("data-original-color"))
                .style("stroke", "none")
        })
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height - 20) + ")")
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y));

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
        if (d3.select('#projection-selector').property("value") === "fancy") {
            drawFancy(selectedColumn);
        } else {
            updateMap(selectedColumn, data);
        }
    });
});

function updateMap(column, data) {
    console.log("Updating map with column: ", column);
    // Create a map of country names/IDs to data values
    var dataMap = {};
    data.forEach(function (d) {
        dataMap[d['ISO Code']] = +d[column];
    });

    // Define a color scale for your data
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
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
