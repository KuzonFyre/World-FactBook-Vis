class Map {
    constructor(container, dataset, color_range = ["white", "darkblue"],
                margin = { top: 10, right: 10, bottom: 10, left: 10 },
                xColName = 'Country', yColName = 'GDP_2021') {
        this.container = container;
        this.dataset = dataset;
        this.color_range = color_range;
        this.margin = margin;
        this.width = 800;
        this.height = 800;
        this.xColName = xColName;
        this.yColName = yColName;
        this.selectedCountryColor = '#ff0000';
        this.defaultCountryColor = '#c0c0c0';

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
            .attr("class", this.container.attr("class"));

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([1, 8]) // set the scale extent as needed
            .on("zoom", () => {
                this.svg.selectAll("g.worldMap").attr("transform", d3.event.transform);
            });
        this.svg.call(this.zoom);
    }



    // Update the size of the chart based on the container's dimensions
    updateSize() {
        console.log("getBoundingClientRect: ", this.container.node().getBoundingClientRect().width);
        this.width = this.container.node().getBoundingClientRect().width - this.margin['left'] - this.margin['right'];
        this.height = this.container.node().getBoundingClientRect().height - this.margin['top'] - this.margin['bottom'];
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
        this.createChoroplethMap();
    }


    async checkFileExists(url) {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    }


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


async createChoroplethMap() {
    try {
        // Map and projection
        var path = d3.geoPath();
        // var projection = d3.geoOrthographic()
        var projection = d3.geoAlbers()
            .scale(Math.min(this.width, this.height) / 8)
            .translate([this.width / 2, this.height - this.height / 2]);

        // Data and color scale
        var data = d3.map();
        var colorScale = d3.scaleThreshold()
            .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
            .range(d3.schemeBlues[7]);

        // Load external data and wait for both promises to resolve
        const [geojson, csvData] = await Promise.all([
            this.loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
            this.loadCountyData('gdpPerCapita.csv', 'Country', 'GDP_2021')
        ]);
        console.log("CSV Data has arrived: ", csvData);
        console.log("GeoJSON Data has arrived: ", geojson);
        console.log("Container Dimensions:", this.width, this.height);

        var awaitColorScale = await this.generateColorScale(csvData, d3.schemeBlues[7]);
        console.log("Colr Scale: ", awaitColorScale);
        console.log("Color Scale for Afghanistan: ", awaitColorScale(csvData['Afghanistan']));

        // Append the projection and the color scale to the SVG
        this.svg.append("g")
            .attr("class", "worldMap")
            .selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path.projection(projection))
            .attr("fill", function (d) {
                var countryData = csvData[d.properties.name];
                if (countryData) {
                    d.total = +countryData;
                    return awaitColorScale(d.total);
                } else {
                    return 'gray';
                }
            });


    } catch (error) {
        // Handle errors
        console.error("Error loading data:", error);
    }
}
    handleCountryClick() {
        this.mapContainer.selectAll('.land')
            .on('click', (event, d) => {
                d3.selectAll('.land').style('fill', this.defaultCountryColor);
                d3.select(event.currentTarget).style('fill', this.selectedCountryColor);
            });
    }
}

