let geodata = 'data/lib.json';
let pinByYearURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=0&single=true&output=csv';
let pinByStatusURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1392819476&single=true&output=csv';
let pinBySectorURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1110695519&single=true&output=csv';
let pinByAdm2URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1804481883&single=true&output=csv';
let descriptionURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1031817710&single=true&output=csv';
let geomData;

let pinYear,
    pinStatus,
    pinSector,
    pinAdm2,
    filteredPinData,
    descriptionDoc;

let yearFilter = "2021";
let yearsRange = [];

let mapsvg, 
    g,
    projection;

$( document ).ready(function() {

  function getData() {
    Promise.all([
      d3.json(geodata),
      d3.csv(pinByYearURL),
      d3.csv(pinByStatusURL),
      d3.csv(pinBySectorURL),
      d3.csv(pinByAdm2URL),
      d3.csv(descriptionURL)
    ]).then(function(data){
      geomData = topojson.feature(data[0], data[0].objects.geom);
      
      data[1].forEach(element => {
        element['PiN'] = parseFloat(element['PiN'].replace(/,/g, ''));
        yearsRange.includes(element['Year']) ? '' : yearsRange.push(element['Year'])
      });
      pinYear = data[1];
      yearFilter = yearsRange[yearsRange.length -1]

      data[2].forEach(element => {
        element['PiN'] = parseFloat(element['PiN'].replace(/,/g, ''));
      });
      pinStatus = d3.nest()
      .key(function(d){ return d['Status']})
      .key(function(d){ return d['Year']})
      .rollup(function(v){ return d3.sum(v, function(d){ return d['PiN']})})
      .entries(data[2]);

      data[3].forEach(element => {
        element['PiN'] = parseFloat(element['PiN'].replace(/,/g, ''));
      });
      pinSector = d3.nest()
          .key(function(d){ return d['Sector']})
          .key(function(d){ return d['Year']})
          .rollup(function(v){ return d3.sum(v, function(d){ return d['PiN']})})
          .entries(data[3]);
      
      data[4].forEach(element => {
        element['PiN'] = parseFloat(element['PiN'].replace(/,/g, ''));
      });
      pinAdm2 = data[4];
      descriptionDoc = data[5][0];
      filteredPinData = pinAdm2.filter(d=>d.Year==yearFilter);
      
      generateTitle();
      generateYearsSelection();
      generateDescription();
      generatePINChart();
      generateCategoryChart();
      initiateMap();
      choropleth();
      generateClustersCharts();
      
      //remove loader and show vis
      $('.loader').hide();
      $('main, footer').css('opacity', 1);
    });

  } //getData


  getData();
  //initTracking();


  function initiateMap() {
    var width = $('#map').width();
    var height = 450;
    var mapScale = width*2.1;

    projection = d3.geoMercator()
      .center([15, 26])
      .scale(mapScale)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    mapsvg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height);

    

    g = mapsvg.append("g").attr('id', 'adm2')
          .selectAll("path")
          .data(geomData.features)
          .enter()
            .append("path")
            .attr('d',path)
            .attr('id', function(d){ 
                return d.properties.ADM2_PCODE; 
            })
            .attr('fill', '#3b88c0')
            .attr('name', function(d){
                return d.properties.ADM2_EN;
            })
            .attr('stroke-width', 1)
            .attr('stroke', '#7d868d');



  } //initiateMap


});

$('#yearSelect').on('change', function(e){
  yearFilter = $('#yearSelect').val();
  filteredPinData = pinAdm2.filter(d=>d.Year==yearFilter);
  choropleth();
});