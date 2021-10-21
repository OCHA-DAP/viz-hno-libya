let mainColor = ['#418FDE'];

function generateTitle (){
    var text = "Libya HNO Trends (" +yearsRange[0] + " – " +yearsRange[yearsRange.length -1]+ ")";
    $('.title h2').html(text);
}
function generateDescription(){
    var text = descriptionDoc['Description'] + ' <a target="blank" href="https://data.humdata.org/dataset/libya-humanitarian-needs-overview">Access datasets on HDX. </a>'
    // $('#description p').text(descriptionDoc['Description']);
    $('#description p').html(text);
}//generateDescription


function generateYearsSelection(){
    var options = "";
    for (let index = yearsRange.length -1; index >= 0; index--) {
        const element = yearsRange[index];
        index == yearsRange.length -1 ? options += '<option value="' + element + '" selected>' + element + '</option>'  : 
            options += '<option value="' + element + '">' + element + '</option>';
    }
    $('#yearSelect').append(options);
}

function generatePINChart(){
    var xArr = ['x' ];//, '2018-01-01', '2019-01-01', '2020-01-01', '2021-01-01'],
        yArr = ['PiN'];
    for (let index = 0; index < yearsRange.length; index++) {
        const element = yearsRange[index] + '-01-01';
        xArr.push(element)
    }
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
                min: 0,
                show: true,
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    // count: 3,
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
    var xArr = ['x'];//, 2018, 2019, 2020, 2021],
    for (let index = 0; index < yearsRange.length; index++) {
        const element = yearsRange[index];
        xArr.push(element);
    }
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
                    // count: 3,
                    format: d3.format('.2s')
                }

            }
        },
        size: {
            height: 200
        },
        padding: {left:45},
    });
} //generateCategoryChart

function generateClustersCharts(){
    $('#clusters').html('');
    
    var clusters = ['Education', 'Health', 'Protection', 'food_security', 'Shelter', 'WASH'];
    for (let i = 0; i < clusters.length; i++) {
        var clusterName = (clusters[i] == "food_security" ? "Food Security" : 
                            clusters[i] == "Shelter" ? "Shelter & NFIs" : clusters[i]);
        var iconName = (clusterName == 'WASH' ? 'humanitarianicons-Wash' : 'humanitarianicons-'+clusterName);
        
        $('#clusters').append('<div class="col-sm-6 col-md-4" id="indicator">' +
        '<div class="chart-header"><i class="humanitarianicons '+iconName+'"></i><h6>'+clusterName+'</h6></div>'+
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
                  '<h6># PiN: '+d3.format(",.0f")(filtered[0].PiN)+'</h6>';
      
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
