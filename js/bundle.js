// window.$ = window.jQuery = require('jquery');
let mainColor = ['#418FDE'];
function generatePINChart(){
    var xArr = ['x', '2018-01-01', '2019-01-01', '2020-01-01', '2021-01-01'],
        yArr = ['PiN'];
    
    pinYear.forEach(element => {
        yArr.push(element['PiN']);
    });
    c3.generate({
        bindto: '#idps',
        data: {
            x: 'x',
            type: 'line',
            columns: [xArr, yArr]
        },
        color: {
            pattern: mainColor
        },
        axis: { 
            x: {
                type: 'timeseries',
                tick: {
                    centered: true,
                    outer: false,
                    format: '%Y'
                }
            },
            y: {
                show: true,
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    count: 3,
                    format: d3.format('.2s')
                }
            }
        },
        size: {
            height: 200
        },
        padding: {left: 45, right:20},
        legend: {
            hide: true
        }
    });

} //generatePINChart

var stackClrs = ['#82B5E9','#418FDE','#1F69B3','#144372'];
function generateCategoryChart(){
    var statusArr = ['IDPs', 'Refugees', 'Migrants', 'Returnees'];
    var xArr = ['x', 2018, 2019, 2020, 2021],
        idpsArr = ['IDPs'],
        refArr = ['Refugees'],
        migrantsArr = ['Migrants'],
        retArr = ['Returnees'];
    
    statusArr.forEach(stat => {
        var data=[];
        pinStatus.forEach(element => {
            element.key == stat ? data = element.values : null;
        });
        data.forEach(d => {
            stat == 'IDPs' ? idpsArr.push(d.value) : 
            stat == 'Refugees' ? refArr.push(d.value) : 
            stat == 'Migrants' ? migrantsArr.push(d.value) : 
            stat == 'Returnees' ? retArr.push(d.value) : null;
        });

    });
    c3.generate({
        bindto: '#category',
        data: {
            x: 'x',
            type: 'bar',
            columns: [xArr, idpsArr, refArr, migrantsArr, retArr],
            groups:[['IDPs', 'Refugees', 'Migrants', 'Returnees']]
        },
        color: {
            pattern: stackClrs
        },
        axis: {
            x: {
                tick: {
                    centered: true,
                    outer: false
                }
            },
            y: {
                show: true,
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    count: 3,
                    format: d3.format('.2s')
                }

            }
        },
        size: {
            height: 200
        },
        padding: {left:45},
	    // tooltip: {
	    // 	format: {
	    // 		value: function(value){
	    // 			return d3.format('d')(value)
	    // 		}
	    // 	}
	    // }
    });
} //generateCategoryChart

function generateClustersCharts(){
    $('#clusters').html('');
    
    var clusters = ['Education', 'Health', 'Protection', 'food_security', 'Shelter', 'WASH'];
    for (let i = 0; i < clusters.length; i++) {
        // $('#clusters').append('<div class="col-md-4"><h5>'+clusters[i]+'</h5><div id="'+clusters[i]+'"></div></div>');
        var clusterName = (clusters[i] == "food_security" ? "Food Security" : 
                            clusters[i] == "Shelter" ? "Shelter & NFIs" : clusters[i]);
        
        $('#clusters').append('<div class="col-sm-6 col-md-4" id="indicator">' +
        '<div class="chart-header"><h5>'+clusterName+'</h5></div>'+
        '<div class="chart-container"><div id="'+clusters[i]+'"></div></div></div>');
        var data,
            yearsArr = ['x'],
            pinArr =['PiN'];
        pinSector.forEach(element => {
            element.key == clusterName ? data = element.values : null;
          });
        data.forEach(element => {
            yearsArr.push(element.key);
            pinArr.push(element.value);
        });
        c3.generate({
            bindto: '#'+clusters[i],
            data: {
                x: 'x',
                type: 'bar',
                columns: [yearsArr, pinArr]
            },
            axis: {
                x: {
                    tick: {
                        centered: true,
                        outer: false
                    }
                },
                y: {
                    tick: {
                        centered: true,
                        outer: false,
                        fit: true,
                        count: 3,
                        format: d3.format('.2s')
                    }
                }
            },
            color: {
                pattern: mainColor
            },
            size: {
                height: 200
            },
            padding: {left:40},
            legend: {
                hide: true
            }
        });
        
    }
} // generateClustersCharts()

var mapColorRange = ['#F8D8D3','#EFA497','#E56A54','#CD3A1F','#8B2715'];//['#C7EEEB', '#8FDFD9', '#1EBFB3', '#168F86', '#0B4742'];

function choropleth(){
    // data = filteredPinData.filter(pt=>pt.Year=='2021')
    var max = d3.max(filteredPinData,function(d){ return d['PiN']});
    console.log(max);
    var mapScale = d3.scaleQuantize()
    .domain([0, max])
    .range(mapColorRange);

    maptip = d3.select('#map').append('div').attr('class', 'd3-tip map-tip hidden');
    
    mapsvg.selectAll('path').each( function(element, index) {
        d3.select(this).transition().duration(500).attr('fill', function(d){
            var filtered = filteredPinData.filter(pt => pt.Mantika== d.properties.ADM2_EN);
            var num = (filtered.length != 0) ? filtered[0].PiN : null ;
            var clr = (num == null) ? '#F2F2EF' : mapScale(num);
            return clr;
        });
    });

    var legend = d3.legendColor()
    .labelFormat(d3.format(',.0f'))
    .title('People in Need')
    .cells(mapColorRange.length)
    .scale(mapScale);


    d3.select('#legend').remove();

    var div = d3.select('#map');
    var svg = div.append('svg')
      .attr('id', 'legend')
        .attr('height', '115px');
        //.attr("transform", "translate(5, -80)");
  
    svg.append('g')
        .attr('class', 'scale')
        .call(legend);

    var mantikas = d3.select('#adm2').selectAll('path')
            .on('mousemove', function(d){
              var filtered = filteredPinData.filter(pt => pt.Mantika== d.properties.ADM2_EN);
              var txt = '<h6>'+d.properties.ADM2_EN+' ('+d.properties.ADM1_EN+')</h6>'+
                  '<h6># PiN: '+filtered[0].PiN+'</h6>';
      
              showMapTooltip(d, maptip,txt);
            })
            .on('mouseout', function(){
              hideMapTooltip(maptip);
            });
} //choropleth

function showMapTooltip(d, maptip, text){
    var mouse = d3.mouse(mapsvg.node()).map( function(d) { return parseInt(d); } );
    maptip
        .classed('hidden', false)
        .attr('style', 'left:'+(mouse[0]+20)+'px;top:'+(mouse[1]+20)+'px')
        .html(text)
}

function hideMapTooltip(maptip) {
    maptip.classed('hidden', true) 
}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

let geodata = 'data/lib.json';
let pinByYearURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=0&single=true&output=csv';
let pinByStatusURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1392819476&single=true&output=csv';
let pinBySectorURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1110695519&single=true&output=csv';
let pinByAdm2URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX0AO2XUkTqwQeTGjSNARG1JpxpXDXW0usQH7U3yn5QoEJi0zR6NITBLbnCQRrhui_qd_FAvdUTbWC/pub?gid=1804481883&single=true&output=csv';

let geomData;

let pinYear,
    pinStatus,
    pinSector,
    pinAdm2,
    filteredPinData;

let yearFilter = "2021";

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
      d3.csv(pinByAdm2URL)
    ]).then(function(data){
      geomData = topojson.feature(data[0], data[0].objects.geom);
      
      data[1].forEach(element => {
        element['PiN'] = +element['PiN'];
      });
      pinYear = data[1];
`     `
      data[2].forEach(element => {
        element['PiN'] = +element['PiN'];
      });
      pinStatus = d3.nest()
      .key(function(d){ return d['Status']})
      .key(function(d){ return d['Year']})
      .rollup(function(v){ return d3.sum(v, function(d){ return d['PiN']})})
      .entries(data[2]);

      data[3].forEach(element => {
        element['PiN'] = +element['PiN'];
      });
      pinSector = d3.nest()
          .key(function(d){ return d['Sector']})
          .key(function(d){ return d['Year']})
          .rollup(function(v){ return d3.sum(v, function(d){ return d['PiN']})})
          .entries(data[3]);
      
      console.log(pinStatus);
      
      data[4].forEach(element => {
        element['PiN'] = +element['PiN'];
      });
      pinAdm2 = data[4];
      
      filteredPinData = pinAdm2.filter(d=>d.Year==yearFilter);
      
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
      .center([20, 26])
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
  console.log(filteredPinData);
  choropleth();
});