// Helper function to determine marker size based on earthquake magnitude
function markerSize(mag) {
  let radius = 1;
  if (mag > 0) {
    radius = mag ** 7;
  }
  return radius;
}

// Helper function to choose color based on earthquake depth
function chooseColor(depth) {
  let color = "black";

  if (depth <= 10) {
    color = "#98EE00";
  } else if (depth <= 30) {
    color = "#D4EE00";
  } else if (depth <= 50) {
    color = "#EECC00";
  } else if (depth <= 70) {
    color = "#EE9C00";
  } else if (depth <= 90) {
    color = "#EA822C";
  } else {
    color = "#EA2C2C";
  }

  return color;
}

// Function to create and render the map with earthquake data and tectonic plates
function createMap(data, geo_data) {
  // Base layers for the map (Street and Topography)
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Initialize overlay layers: markers, heatmap, circles, and tectonic plates
  let markers = L.markerClusterGroup();
  let heatArray = [];
  let circleArray = [];

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let location = row.geometry;

    if (location) {
      let point = [location.coordinates[1], location.coordinates[0]];

      // Create marker
      let marker = L.marker(point);
      let popup = `<h1>${row.properties.title}</h1>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // Add point to heatmap
      heatArray.push(point);

      // Create circle marker with depth-based color and magnitude-based radius
      let circleMarker = L.circle(point, {
        fillOpacity: 0.75,
        color: chooseColor(location.coordinates[2]), // Color based on depth
        fillColor: chooseColor(location.coordinates[2]),
        radius: markerSize(row.properties.mag) // Size based on magnitude
      }).bindPopup(popup);

      circleArray.push(circleMarker);
    }
  }

  // Create heatmap layer
  let heatLayer = L.heatLayer(heatArray, {
    radius: 25,
    blur: 20
  });

  // Create circle layer
  let circleLayer = L.layerGroup(circleArray);

  // Tectonic plates layer
  let geo_layer = L.geoJSON(geo_data, {
    style: {
      color: "firebrick",
      weight: 5
    }
  });

  // Base layers and overlay layers for the map
  let baseLayers = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let overlayLayers = {
    "Markers": markers,
    "Heatmap": heatLayer,
    "Circles": circleLayer,
    "Tectonic Plates": geo_layer
  };

  // Initialize the map with starting position and layers
  let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [street, markers, geo_layer]
  });

  // Add layer control for base and overlay layers
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);

  // Add legend for depth color coding
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let legendInfo = "<h4>Earthquake Depth</h4>";
    legendInfo += "<i style='background: #98EE00'></i>-10-10<br/>";
    legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
    legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
    legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
    legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
    legendInfo += "<i style='background: #EA2C2C'></i>90+";
    div.innerHTML = legendInfo;
    return div;
  };
  legend.addTo(myMap);
}

// Function to fetch earthquake and tectonic plate data and render the map
function doWork() {
  // Fetch earthquake data and tectonic plate data
  let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(earthquakeUrl).then(function (data) {
    d3.json(tectonicPlatesUrl).then(function (geo_data) {
      let data_rows = data.features;
      // Call createMap to render the data
      createMap(data_rows, geo_data);
    });
  });
}

// Execute the function to fetch data and render the map
doWork();
