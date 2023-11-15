class Map {
    constructor() {
        this.selectedCountryColor = '#ff0000';
        this.defaultCountryColor = '#c0c0c0';
        this.map = d3.geomap()
            .geofile('https://d3-geomap.github.io//d3-geomap/topojson/world/countries.json');
        this.mapContainer = d3.select('#map');
        this.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                this.mapContainer.selectAll('g').attr('transform', event.transform);
            });
        this.initMap();
        this.initZoom();
    }

    initMap() {
        this.map.draw(this.mapContainer);
    }

    initZoom() {
        this.mapContainer.call(this.zoom);
    }

    handleCountryClick() {
        this.mapContainer.selectAll('.land')
            .on('click', (event, d) => {
                d3.selectAll('.land').style('fill', this.defaultCountryColor);
                d3.select(event.currentTarget).style('fill', this.selectedCountryColor);
            });
    }
}

