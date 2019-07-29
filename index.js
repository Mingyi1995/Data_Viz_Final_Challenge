let svg       = d3.select("svg"),
    gChart    = svg.append("g"),

    client    = new carto.Client({
                  apiKey: '5023e9dc4ea9fb885e54dca69bdb13fbc7328caf',
                  username: 'chang-du'
                });
let base = createBaseMap();
let sqlSource = cartoLayer(base);

var initBarChart = function (newData) {
  // newData = requests.timestamp
  console.log(newData);
  createBarChart(newData);
  totalView.off('dataChanged', initBarChart);
};

const totalView = new carto.dataview.TimeSeries(
    sqlSource, 'to_timestamp', {aggregation: carto.dataview.timeAggregation.HOUR}
  ).on('dataChanged', initBarChart);

client.addDataview(totalView);

function createBarChart(data){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scale.linear();

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}


function createBaseMap() {
let center    = [40.7, -73.975],
    cusp      = [40.692908,-73.9896452],
    baseLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                            { maxZoom: 18, }),
    baseDark  = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                            { maxZoom: 18, }),
    dMap      = L.map('map', {
                  center: center,
                  zoom: 13,
                  layers: [baseLight]
                }),
    svg       = d3.select(dMap.getPanes().overlayPane).append("svg"),
    g         = svg.append("g").attr("class", "leaflet-zoom-hide");

    L.control.layers({
                  "Light": baseLight,
                  "Dark" : baseDark,
                 }).addTo(dMap);

return [svg, g, dMap];
}

function cartoLayer(base){
  let query = `
          SELECT requests.cartodb_id, manhattan.the_geom_webmercator,
            requests.timestamp, to_timestamp(requests.timestamp),
            requests.requested_pickup
          FROM requests JOIN manhattan
          ON manhattan.id = requests.requested_pickup
          WHERE requests.actual_pickup = -1`,

      css = `
          #layer {
            marker-width: 7;
            marker-fill: #EE4D5A;
            marker-fill-opacity: 0.9;
            marker-line-color: #FFFFFF;
            marker-line-width: 1;
            marker-line-opacity: 1;
            marker-placement: point;
            marker-type: ellipse;
            marker-allow-overlap: true;
          }`;

   let sqlSource = new carto.source.SQL(query);
   let cartoStyle = new carto.style.CartoCSS(css);
   let cartoLayer = new carto.layer.Layer(sqlSource, cartoStyle);
   client.addLayer(cartoLayer);
   client.getLeafletLayer().addTo(base[2]);
   return sqlSource;
}
