/* Copyright Andrew McConachie <andrew@depht.com> 2024 */

$(function() {
  $.datepicker.setDefaults({
    minDate: new Date(2015, 3 - 1, 2),
    maxDate: "-2d",
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
  })
  $( "#map-date" ).datepicker();
});

$(document).ready(function() {
  document.querySelector("#map-date").value = new Date(Date.now() - 259200000).toISOString().split("T")[0]; // 3 days
  rssac002_update_chart();
});

function rssac002_update_chart(){
  rssac002_make_chart(document.getElementById('map-date').value);
}

function rssac002_make_chart(map_date){
  var options = {
    chart: {
      renderTo: 'container',
      map: '',
    },
    title: {
      text: 'DNS Root Server Instances'
    },
    legend: {
      enabled: true,
    },
    subtitle: {
      text: 'Source: https://root-servers.org'
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    mapView: {
      fitToGeometry: {
        type: 'MultiPoint',
        coordinates: [
          [-164, 54], // Alaska west
          [-35, 84],  // Greenland north
          [179, -38], // New Zealand east
          [-68, -55]  // Chile south
        ]
      }
    },
    tooltip: {
      formatter: function(tooltip){
        if(this.point.isCluster && this.series.name == 'RSS'){
          var total = 0;
          var letters = {};
          $.each(this.point.clusteredData, function(cl, pp){
            total += 1;
            if(letters[pp.options.rsi] == undefined){
              letters[pp.options.rsi] = 1;
            }else{
              letters[pp.options.rsi] += 1;
            }
          });
          var rv = total + ' Sites: ';
          $.each(letters, function(rsi, sites){
            if(sites == 1){
              rv += rsi + ' ';
            }else{
              rv += rsi + '(' + sites + ') ';
            }
          });
          return rv;
        }else if(this.point.isCluster){
          return 'Sites: ' + this.point.clusteredData.length;
        }else if(this.series.name == 'RSS'){
          return this.point.rsi + '<br/>' + this.point.town + '<br/><span style="font-size:10px">Instances: ' + this.point.count + 
            '<br/>Lat: ' + this.point.lat + ' Lon: ' + this.point.lon + '</span>';
        }else{
          return this.point.town + '<br/><span style="font-size:10px">Instances: ' + this.point.count + 
            '<br/>Lat: ' + this.point.lat + ' Lon: ' + this.point.lon + '</span>';
        }
      },
    },
    plotOptions: {
      series: {
        marker: {
          symbol: 'circle',
        },
        states: {
          inactive: {
            opacity: 1,
          },
        },
        events: {
          legendItemClick: function(event){
            for(var ii = 0; ii<this.chart.series.length; ii++){
              if(this.chart.series[ii].name != this.name && this.chart.series[ii].name != 'World'){
                this.chart.series[ii].hide();
              }
            }
          },
        },
        turboThreshold: 10000, // Should be greater than total number of data points across all series
      },
      mappoint: {
        cluster: {
          minimumClusterSize: 5,
          enabled: true,
          drillToCluster: false,
          allowOverlap: false,
          layoutAlgorithm: {
            type: 'grid',
            gridSize: '5%',
          },
        },
      },
    },
    series: [
      {
        name: 'World',
        color: '#E0E0E0',
        enableMouseTracking: false,
        showInLegend: false,
      },
    ],
  };

  // Initialize stuff
  var RSS = {};
  RSS.name = 'RSS';
  RSS.type = 'mappoint';
  RSS.color = '#89B5F0';
  RSS.data= [];

  var total_instances = 0;
  var RSIs = [];
  
  // Read ip_version from HTML
  var ip_version = document.querySelector('input[name = "ip_version"]:checked').value;

  // Determine request JSONs
  var req_data = {
    rsi: 'a-m',
    start_date: map_date,
    end_date: map_date,
  };

  $.getJSON("https://code.highcharts.com/mapdata/custom/world-continents.topo.json", function(topology){
    options.chart.map = topology;    
    $.ajax({
      url: "/api/v1/instances-detail",
      type: "GET",
      dataType: "json",
      data: req_data,
      success: function(res){
        $.each(res, function(rsi, dates){
          points = {};
          points.name = rsi;
          points.type = 'mappoint';
          points.visible = false;
          points.color = '#89B5F0';
          points.data = [];
          $.each(dates, function(date, sites){
            if(res[rsi][date] != null){
              $.each(sites, function(site, _){
                var pushit = false;
                if(ip_version == '4' && res[rsi][date][site]['IPv4']){
                  pushit = true;
                }else if(ip_version == '4_only' && res[rsi][date][site]['IPv4'] && !res[rsi][date][site]['IPv6']){
                  pushit = true;
                }else if(ip_version == '6' && res[rsi][date][site]['IPv6']){
                  pushit = true;
                }else if(ip_version == '6_only' && res[rsi][date][site]['IPv6'] && !res[rsi][date][site]['IPv4']){
                  pushit = true;
                }else if(ip_version == 'both' && res[rsi][date][site]['IPv4'] && res[rsi][date][site]['IPv6']){
                  pushit = true;
                }
                if(pushit){
                  var p = {};
                  p.rsi = rsi;
                  p.count = res[rsi][date][site]['Count'];
                  p.town = res[rsi][date][site]['Town'];
                  p.lat = res[rsi][date][site]['Latitude'];
                  p.lon = res[rsi][date][site]['Longitude'];
                  points.data.push(p);
                  RSS.data.push(p);
                  total_instances += p.count;
                }
              });
            }
          });
          RSIs.push(points);
        });
        options.series.push(RSS);
        $.each(RSIs, function(rsi, points){
          options.series.push(RSIs[rsi]);
        });

        // Generate title text
        if(ip_version == '4'){
          options.title.text = total_instances + ' instances in ' + RSS.data.length + ' IPv4 Enabled Sites as of ' + map_date;
        }else if(ip_version == '4_only'){
          options.title.text = total_instances + ' instances in ' + RSS.data.length + ' IPv4 Only Sites as of ' + map_date;
        }else if(ip_version == '6'){
          options.title.text = total_instances + ' instances in ' + RSS.data.length + ' IPv6 Enabled Sites as of ' + map_date;
        }else if(ip_version == '6_only'){
          options.title.text = total_instances + ' instances in ' + RSS.data.length + ' IPv6 Only Sites as of ' + map_date;
        }else{
          options.title.text = total_instances + ' instances in ' + RSS.data.length + ' Dual Stack Sites as of ' + map_date;
        }

        new Highcharts.mapChart(options);
      }});
  });
}


