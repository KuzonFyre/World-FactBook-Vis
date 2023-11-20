class Main {
    constructor() {
        this.map = null;
    }

    init() {
        var dataSetPath = "../extracted_data.csv";
        this.getCountryColumns(dataSetPath);
        this.createMap(dataSetPath);
    }

    createMap(dataSetPath) {
        var mapContainer = d3.select('.mapContainer');

        if (this.map) {
            console.log("Map Exists");
            this.map.remove();
        }
        this.map = new Map(mapContainer, dataSetPath);
        console.log("Map Created");
    }

    // Logic for DropDown Menu
    toggleDropdown() {
        var dropdown = document.getElementById("dropdown");
        dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
    }

    closeDropdown(event) {
        if (!event.target.matches('.button')) {
            var dropdown = document.getElementById("dropdown");
            if (dropdown.style.display === "block") {
                dropdown.style.display = "none";
            }
        }
    }

    // change projection when user selects new map mode
    changeProjection(projectionType) {
        console.log("Before Change", this.map);
        this.map.removeMap();
        this.map.changeProjection(projectionType);
        console.log("After Change", this.map);
    }
    async checkFileExists(url) {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    async getCountryColumns(csvPath) {
        try {
            // Check if file exists
            const fileExists = await this.checkFileExists(csvPath);
            let selector = document.getElementById('dataSelector');
            if (!fileExists) {
                console.error(`File not found: ${csvPath}`);
                return null;
            }
            await new Promise((resolve) => {
                d3.csv(csvPath, (rawData) => {
                    rawData.columns.forEach(column => {
                        let option = document.createElement('option');
                        option.value = column;
                        option.text = column;
                        selector.appendChild(option);
                    });

                });
            });
            selector.addEventListener('change', function () {
                // TODO
            });
        } catch (error) {
            console.error("Error loading dataset:", error);
            throw error;
        }
    }

}

