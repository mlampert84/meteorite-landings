//modelled after "Zoom to Bounding Box II - Updated for d3 v4" https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2

var height = 600,
    width = 880;
var svg = d3.select("body")
    .insert("svg","button")
    .attr("width", width)
    .attr("height", height);

//g is the container for the paths.  By transforming g, all the contents, i.e. the paths will also transform.
var g = svg.append("g");
var projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .scale(140);



d3.queue().defer(d3.json, "world-countries.topojson")
    .defer(d3.json, "meteorite-strike-data.json")
    .await(ready);


var zoom = d3.zoom()
             .scaleExtent([.5, 20])
             .on("zoom",function(){
          g.attr("transform",d3.event.transform);

              });
svg.call(zoom);

resetZoom = document.getElementById("zoomReset");
resetZoom.onclick=function(){svg.call(zoom.transform,d3.zoomIdentity)};

function ready(error, world, meteorites) {
  drawMap(world,meteorites);

}

function drawMap(world,meteorites){
   var path = d3.geoPath().projection(projection);

    // console.log(meteorites);
    var meteoriteMasses = meteorites.features.map(a => parseInt(a.properties.mass));

    meteoriteMasses.sort(function(a, b) {
        return a - b
    });
    // console.log(meteoriteMasses);

    var countries = topojson.feature(world, world.objects.countries).features;


    g.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path);

    g.selectAll(".meteorite")
        .data(meteorites.features)
        .enter()
        .append("path")
        .attr("d", path.pointRadius(function(d, i) {
            return Math.max(1, Math.log(d.properties.mass / 10000) / Math.log(10) * 5);
            // return Math.log(d.properties.mass);
        }))
        .attr("class", "meteorite")
        .on("mouseover",handleMouseOver)
        .on("mouseout",handleMouseOut);



}



function handleMouseOver(d,i){

var meteorYear = /\d{4}/.exec(d.properties.year)[0];
var xPosition;
if(d3.event.pageX + 150 > window.innerWidth){
 xPosition = d3.event.pageX - 100;
}
else {
  xPosition = d3.event.pageX + 10;
}

 d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("left",xPosition+"px")
    .style("top",(d3.event.pageY + 10)+"px")
    .html("<span>Name: " + d.properties.name + "</span>"
          +"<br>"
          +"<span>Year: " + meteorYear + "</span>"
          +"<br>"
          +"<span>Mass: " + d.properties.mass + "</span>");

}

function handleMouseOut(){
   d3.selectAll(".tooltip").remove();
}
