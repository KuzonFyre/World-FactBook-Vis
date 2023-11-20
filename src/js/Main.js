class Main {
    constructor() {
        this.map = null;
    }

    init() {
        this.createMap();
    }

    createMap() {
        var mapContainer = d3.select('.mapContainer');
        var dataSetPath = "../../kaggleDataset/parsedData/gdpPerCapita.csv";
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
}

