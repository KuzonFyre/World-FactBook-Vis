class Map {
    constructor(container, dataset, color_range = ["white", "darkblue"],
                margin = { top: 10, right: 10, bottom: 10, left: 10 },
                xColName = 'Country', yColName = 'GDP_2021') {
        this.container = container;
        this.dataset = dataset;
        this.color_range = color_range;
        this.margin = margin;
        this.width = 0;
        this.height = 0;
        this.xColName = xColName;
        this.yColName = yColName;
        this.selectedCountryColor = '#ff0000';
        this.defaultCountryColor = '#c0c0c0';
        this.projection = d3.geoAlbers();

        // Initialize the SVG and viewBoxSize
        this.svg = null;
        this.setUpSVG();
        this.updateSize();
    }


    // Create the SVG container
    setUpSVG() {
        this.svg = this.container
            .append("svg") 
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("transform-origin", "center")
            .style("width", "100%")
            .style("height", "100%")
            .attr("class", "svg-content");

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([1, 8]) // set the scale extent as needed
            .on("zoom", () => {
                this.svg.selectAll("g").attr("transform", d3.event.transform);
            });
        // Create drag behavior TODO: NOT WORKING
        this.drag = d3.drag()
            .on("drag", () => {
                console.log("dragging");
                const [x, y] = this.projection.invert([d3.event.x, d3.event.y]);
                this.projection.translate([d3.event.x, d3.event.y]);
            });
        this.svg.call(this.zoom);
        this.svg.call(this.drag);
    }


    // Update the size of the chart based on the container's dimensions
    updateSize() {
        this.width = this.container.node().getBoundingClientRect().width - this.margin['left'] - this.margin['right'];
        this.height = this.container.node().getBoundingClientRect().height - this.margin['top'] - this.margin['bottom'];
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
        this.createChoroplethMap();
    }


    // Check if a file exists
    async checkFileExists(url) {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    }


    // Load JSON with a promise
    async loadJSON(url) {
        return new Promise((resolve, reject) => {
            d3.json(url, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }


    // Generates the color scale based on the data
    // TODO - not working correctly
    async generateColorScale(data, colorRange) {
        // Extract values from the data
        const values = Object.values(data);

        // Automatically calculate domain and thresholds
        const domain = d3.extent(values);
        const thresholds = d3.ticks(domain[0], domain[1], colorRange.length - 1);

        // Create the color scale
        const colorScale = d3.scaleThreshold()
            .domain(thresholds)
            .range(colorRange);

        return colorScale;
    }


    // Loads the data into a simple dictionary
    // Uses async/await and promises to ensure DOM is loaded
    async loadCountyData(csvPath, xColName, yColName) {
        console.log(csvPath);
        try {
            // Check if file exists
            const fileExists = await this.checkFileExists(csvPath);
            if (!fileExists) {
                console.error(`File not found: ${csvPath}`);
                return null;
            } else {
                console.log("File found");
        }
            // Use a Promise to wrap the d3.csv callback
            const data = await new Promise((resolve, reject) => {
            d3.csv(csvPath, (error, rawData) => {
                if (error) {
                    reject(error);
                } else {
                    // Process the data into a dictionary
                    const processedData = {};
                    rawData.forEach(d => {
                        processedData[d[xColName]] = +d[yColName];
                    });
                    resolve(processedData);
                }
            });
            });
        return data;
        } catch (error) {
            console.error("Error loading dataset:", error);
            throw error;
        }
    }


    // ********** MAIN FUNCTION FOR MAP ********** // 
    async createChoroplethMap() {
        try {
            // Map and projection
            var path = d3.geoPath().projection(this.projection);
            var projection = this.projection
                .scale(Math.min(this.width, this.height) / 4)
                .translate([this.width / 2, this.height / 2]);

            // Load external data and wait for both promises to resolve
            const [geojson, csvData] = await Promise.all([
                this.loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
                this.loadCountyData(this.dataset, 'Country', 'GDP_2021')
            ]);
            var awaitColorScale = await this.generateColorScale(csvData, d3.schemeBlues[7]);

            console.log("CSV Data has arrived: ", csvData);
            console.log("GeoJSON Data has arrived: ", geojson);
            console.log("Container Dimensions:", this.width, this.height);
            console.log("Color Scale: ", awaitColorScale);
            console.log("Color Scale for Afghanistan: ", awaitColorScale(csvData['Afghanistan']));

            // Append the projection and the color scale to the SVG
            // color the countries based off of their Y value and color scale
            this.svg.append("g")
                .selectAll("path")
                .data(geojson.features)
                .enter().append("path")
                .attr("d", path.projection(projection))
                .attr("fill", function (d) {
                    var countryData = csvData[d.properties.name];
                    if (countryData) {
                        console.log("HERE!");
                        d.total = +countryData;
                        return awaitColorScale(d.total);
                    } else {
                        return 'gray';
                    }
                })
                // Add mouseover and mouseleave events 
                .attr("class", function(d){ return d.properties.name }) 
                .on("mouseover", this.mouseOver)
                .on("mouseleave", this.mouseLeave);

        } catch (error) {
            // Handle errors
            console.error("Error loading data:", error);
        }
    }


    // Remove the map 
    async removeMap() {
        if (this.svg){
            this.svg.selectAll("*").remove();
            console.log("Map Removed");
        }
    }


    // Update the projection based on the selected type
    changeProjection(projectionType) {
        switch (projectionType) {
            case 'albers':
                this.projection = d3.geoAlbers()
                    .scale(Math.min(this.width, this.height) / 4)
                    .translate([this.width / 2, this.height / 2]);
                break;
            case 'mercator':
                this.projection = d3.geoMercator()
                    .scale((Math.min(this.width, this.height) - 1) / (2 * Math.PI))
                    .translate([this.width / 2, this.height / 2]);
                break;
            case 'orthographic':
                this.projection = d3.geoOrthographic()
                    .scale(Math.min(this.width, this.height) / 2 - 1)
                    .translate([this.width / 2, this.height / 2])
                    .clipAngle(90)
                    .precision(.1);
                break;
            // TODO: ADD ROTATION TO SEE OTHER SIDE OF GLOBE
            case 'stereographic':
                this.projection = d3.geoStereographic()
                    .scale(Math.min(this.width, this.height) / 2 - 1)
                    .translate([this.width / 2, this.height / 2])
                    .clipAngle(90)
                    .precision(.1);
                break;
            case 'miller':
                this.projection = d3.geoMiller()
                    .scale(Math.min(this.width, this.height) / 2 / Math.PI)
                    .translate([this.width / 2, this.height / 2]);
                break;
            case 'azimuth':
                var centerCoordinates = [104, 35]; // [longitude, latitude]
                this.projection = d3.geoAzimuthalEqualArea()
                    .rotate([-centerCoordinates[0], -centerCoordinates[1], 0])
                    .center([0, 0])
                    .scale(Math.min(this.width, this.height) / 2 / Math.PI)
                    .translate([this.width / 2, this.height / 2]);
                break;
        }
        // Redraw the map with the updated projection
        this.createChoroplethMap();
    }


    mouseOver = (d) => {
        console.log("Hovering over: ", d.properties.name);
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
        d3.select(d3.event.target)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "#EB212E")
    }

    mouseLeave = (d) => {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
        d3.select(d3.event.target)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
    }
}

