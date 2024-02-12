/* Copyright Andrew McConachie <andrew@depht.com> 2024 */

Highcharts.Templating.helpers.log = function () {
    console.log(arguments[0].ctx);
};

var options = { // We had to make this Global
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
    pointFormat: '{point.town} ({point.rsi})<br/> <span style="font-size:10px">Lat: {point.lat:.3f} Lon: {point.lon:.3f}' +
      '{#if (ne 1 point.count)} <br/>Count:{point.count} {/if}</span>',
  },
  plotOptions: {
    series: {
      states: {
        inactive: {
          opacity: 1,
        },
      },
      events: {
        legendItemClick: function(event){
          rssac002_disable_series(this.name);
        },
      },
      turboThreshold: 10000,
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
      tooltip: {
        //clusterFormat: '{log}',
        clusterFormat: "{#if (eq series.index 1)}" +  
          "Sites: {#each point.clusteredData}" + "{point.clusteredData.{(@index)}.options.rsi} " + "{/each}" + 
          "{else}" + 
          "Sites: {point.clusteredData.length}" + 
          "{/if}",
      },
    },
  },
  series: [],
};

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
  // Set calendar to 2 days previous
  document.querySelector("#map-date").value = new Date(Date.now() - 172800000).toISOString().split("T")[0];
  rssac002_update_chart();
});

// Disables all series except where series.name == exclude
function rssac002_disable_series(exclude){
  for(var ii=0; ii<options.series.length; ii++){
    if(options.series[ii].name == 'World'){
      continue;
    }
    if(options.series[ii].name == exclude){
      options.series[ii].visible = true;
    }else{
      options.series[ii].visible = false;
    }
  }
  rssac002_draw_map(options);
}

function rssac002_draw_map(options){
  new Highcharts.mapChart(options);
}

function rssac002_update_chart(){
  rssac002_fill_options(document.getElementById('map-date').value);
}

function rssac002_fill_options(map_date){
  // Initialize stuff
  options.series = [];

  var world = {};
  world.name = 'World';
  world.color = '#E0E0E0';
  world.enableMouseTracking = false;
  world.showInLegend = false;
  options.series.push(world);

  var RSS = {};
  RSS.name = 'RSS';
  RSS.type = 'mappoint';
  RSS.data= [];

  var total_instances = 0;
  var rv = [];
  
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
                  p.rsi = rsi.toUpperCase();
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
          rv.push(points);
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

        options.series.push(RSS);
        $.each(rv, function(rsi, points){
          rv[rsi].visible = false;
          options.series.push(rv[rsi]);
        });
        rssac002_draw_map(options);
      }});
  });
}


