class Main {
    constructor() {
        // Initialize properties here if needed
    }

    createMap() {
        var mapContainer = d3.select('.mapContainer');
        var dataSetPath = "../../kaggleDataset/parsedData/gdpPerCapita.csv";
        new Map(mapContainer, dataSetPath);
        console.log("Map Created");
    }

    init() {
        this.createMap();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const main = new Main();
    main.init();
});