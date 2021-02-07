
// ...................................
// API and URL
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let faultlinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// ...................................
// initilizing layer groups
let Earthquakes = new L.LayerGroup();
let TectPlates = new L.LayerGroup();

// ...................................
// Tile layers
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});

var greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});


// ...................................
// Baselayer and overlay objects
let basemap = {"Satellite": satellite,
                "Outdoor": outdoor,
                "Greyscale": greyscale,
};

let overlaymaps = {"Earthquakes": Earthquakes,
                   "Tectonic Plates": TectPlates
};

// ...................................
// Create Map on load
let map = L.map("map", {
            center: [37.09,-95.71],
            zoom: 2,
            layers:[satellite, Earthquakes]
});

// ...................................
//  Add baselayer and overlay on map
L.control.layers(basemap, overlaymaps).addTo(map);


// ...................................
// pulling data from Json file
d3.json(earthquakeURL, function(data){
    // marker color
    function markerColor(color){
        return  color > 5 ? "#a54500":
                color > 4 ? "#cc5500":
                color > 3 ? "#ff6f08":
                color > 2 ? "#ff9143":
                color > 1 ? "#ffb37e":
                    "#ffcca5";
    };

    // marker size
    function markersize(size){
        // checks for 0 sized markers and changes to size 1
        if(size === 0){
            return 1;
        }
        return size * 2.5;
    };
    
    // marker info/style
    function markerstyle(info){
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: markerColor(info.properties.mag),
            color: "#000000",
            radius: markersize(info.properties.mag),
            stroke: true,
            weight: 0.5
        };
    };
    
    // ...................................
    // GeoJson Layer for EarthQuakes
    L.geoJson(data,{
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng);
        },
        style: markerstyle,
        onEachFeature: function(feature, layer){
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + 
                "</h3><h3>Location: " + feature.properties.place + 
                "</h3><hr><p>" +new Date(feature.properties.time) + "</p>");
        }
    }).addTo(Earthquakes);

    Earthquakes.addTo(map);

    // ...................................
    // GeoJson Layer for faultlines
    // Pulling Data from faultlineURL
    d3.json(faultlinesURL, function(data){
        L.geoJson(data, {
            weight: 2,
            color: "red"
        }).addTo(TectPlates);

        TectPlates.addTo(map);
    });


    // ...................................
    // Adding Legend to the map
    let legend = L.control({position: "bottomtight"});

    legend.onAdd = function(){
        let div = L.DomUtil.create("div", "info legend"),
                grade = [0,1,2,3,4,5];
                
            div.innerHTML += "<h3>Magnitude</h3>"

            for(let i = 0; i<grade.length; i++){
                '<i style="background: ' + markerColor(grade[i] + 1) + '"></i> ' +
                grade[i] + (grade[i + 1] ? '&ndash;' + grade[i + 1] + '<br>' : '+');                
        }
        return div;

    };

    legend.addTo(map);

});