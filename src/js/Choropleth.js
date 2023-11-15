class ChoroplethBuilder{
    constructor(container, dataset, color_range=["white", "darkblue"], margin) {
        this.container = container;
        this.dataset = dataset;
        this.countyData = {};
        this.fill = d3.scaleLog().range(color_range);
        this.margin = margin
        this.width = 0;
        this.height = 0;
        this.colorScale = null;
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
    }


    // Update the size of the chart based on the container's dimensions
    updateSize() {
        this.width = this.container.node().getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = this.container.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom;
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
        this.drawMap();
    }

    

    async loadCountyData() {
        // Assuming you have a property called 'rate' in your dataset
        return new Promise((resolve, reject) => {
            d3.csv(this.dataset)
                .then(data => {
                    data.forEach(d => {
                        d["County"] = d["County"];
                        d["Rate"] = +d["Rate"];
                    });
                    console.log("My data:", data);
                    this.countyData = data;
                    resolve(data); // Resolve the promise with the loaded data
                })
                .catch(error => {
                    console.error("Error loading dataset:", error);
                    reject(error); // Reject the promise if there's an error
                });
        });
    }


    // Main function to draw the State Map
    async drawMap() {
        // Get state data, set up projection and path
        const svgStateData = await this.fetchCountyData();
        console.log("SVG Data has arrived: ", svgStateData.features);
        const projection = d3.geoMercator()
            .scale(1)
            .translate([0,0]);
        const path = d3.geoPath().projection(projection);

        // compute bounds, scale, and translation
        const bounds = path.bounds(svgStateData);
        const scaleFactor = 0.95 / Math.max(
            (bounds[1][0] - bounds[0][0]) / this.width,
            (bounds[1][1] - bounds[0][1]) / this.height
        );
        const translation = [
            (this.width - scaleFactor * (bounds[1][0] + bounds[0][0])) / 2,
            (this.height - scaleFactor * (bounds[1][1] + bounds[0][1])) / 2
        ];
        // update projection based on computed scales and translations
        console.log("scaleFactor: ", scaleFactor, "\ntranslation: ", translation);
        projection.scale(scaleFactor).translate(translation);

        // Append topojson data to svg and draw the graphic
        this.svg.append("g")
            .attr("class", "state")
            .selectAll("path")
            .data(svgStateData.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "white")

        // load county unemployment data 
        await this.loadCountyData();
        console.log("County Data: ", this.countyData);

        // build color chart 
        const colorScale = await this.createColorScale(); // Wait for the color scale to be ready
        console.log("colorScale inside Draw: ", colorScale);

        // Call mouse event function
        this.mouseEvents(svgStateData, path, colorScale);

        // Create the legend 
        this.createLegend(colorScale);

        // Create the Title 
        this.updateTitles();
    }


    async createColorScale() {
        return new Promise((resolve, reject) => {
            const rates = this.countyData.map(d => d.Rate);
            console.log("My Rates:", rates);
            const colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(rates), 15]);
            console.log("colorScale: ", colorScale);
            resolve(colorScale);
        });
    }


    // Grab data needed to draw state from file system 
    async fetchCountyData() {
        try {
            const state = await d3.json("data/us-states/CA-06-california-counties.json");
            const data = "cb_2015_" + "california" + "_county_20m";
            const svgStateData = topojson.feature(state, state.objects[data]);
            return svgStateData;
        } catch (error) {
            console.error("Error fetching state data:", error);
            return null;
            }
        }


    colorCounty(countyName, colorScale) {
        const rate = this.countyData.find(entry => entry.County === countyName)?.Rate;
        // console.log("Rate of ", countyName, " is ", rate);
        return colorScale(rate);
    }


    async mouseEvents(stateData, path, colorScale) {
        d3.csv("data/co-est2016-alldata.csv").then(data => {
            this.appendCounties(stateData, path, colorScale);
            this.addMouseEvents(colorScale);
        });
    }


    appendCounties(stateData, path, colorScale) {
        this.svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(stateData.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", d => {
                if (d.properties.NAME === undefined) return "black";
                else {
                    const countyName = d.properties.NAME + " County";
                    return this.colorCounty(countyName, colorScale);
                } 
        });
    }


    addMouseEvents() {
    var original_color = null;
    d3.selectAll(".counties path")
        .on("mouseenter", function (d) {
            original_color = d3.select(this).style("fill");
            d3.select(this).style("fill", "#e41a1c");
        })
        .on("mouseleave", function (d) {
            d3.select(this).style("fill", function () {
                return original_color;
            });
        });
    }


    // Function to create the legend
    createLegend(colorScale) {
        console.log("This.width:", this.width);
        const legendWidth = 200;
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${this.width - legendWidth - 20}, 20)`);

        const legendScale = d3.scaleLinear()
            .domain([0, 16]) // Adjust the domain based on your color scale
            .range([0, 200]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        legend.append("g")
            .attr("class", "axis")
            .call(legendAxis);

        const gradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "legendGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        // Add color stops to the gradient
        gradient.selectAll("stop")
            .data(colorScale.ticks(10))
            .enter().append("stop")
            .attr("offset", d => (d - colorScale.domain()[0]) / (colorScale.domain()[1] - colorScale.domain()[0]))
            .attr("stop-color", d => colorScale(d));

        // Create the color rectangle in the legend
        legend.append("rect")
            .attr("x", 0)
            .attr("y", -10)
            .attr("width", 200)
            .attr("height", 10)
            .style("fill", "url(#legendGradient)");
    }


    // UPDATE TITLES
    updateTitles() {
        // remove old titles 
        this.svg.selectAll(".title").remove();

        // main title
        this.svg.append("text")
            .attr("class", "title")
            .attr("x", (this.margin.right + this.margin.left + this.width) / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("font-size", 28)
            .text("California Average Unemployment rates by County in 2015");
    }

} // END CLASS

