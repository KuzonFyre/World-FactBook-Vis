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
        this.map = new Map(mapContainer, dataSetPath, 'GDP');
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
    updateMap(dataColumn) {
        console.log("Updating map with column: ", dataColumn);
        if (this.map) {
            this.map.updateData(dataColumn); // Assuming you have a method in your Map class to update the data
        } else {
            console.error("Map object not initialized");
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
        // Check if file exists
        const fileExists = await this.checkFileExists(csvPath);
        let selector = document.getElementById('dataSelector');
        if (!fileExists) {
            console.error(`File not found: ${csvPath}`);
            return null;
        }
        // Load CSV and populate the selector
        d3.csv(csvPath, rawData => {
            rawData.columns.forEach(column => {
                let option = document.createElement('option');
                option.value = column;
                option.text = column;
                selector.appendChild(option);
            });
        });

        let mainContext = this;
        selector.addEventListener('change', function () {
            console.log("HELLO!");
            let selectedColumn = this.value;
            mainContext.updateMap(selectedColumn);
            console.log("selectedColumn", selectedColumn);
        });
    }


}

