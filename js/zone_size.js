/* Copyright Andrew McConachie <andrew@depht.com> 2024 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: 'container',
      type: '',
      zoomType: 'x'
    },
    title: {
      text: ''
    },
    subtitle: {
      text: 'Source: RSSAC002 Data'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: null
      },
    },
    yAxis: {
      startOnTick: false,
      min: 0,
      title: {
        text: 'Octets'
      },
    },
    plotOptions: {},
    series: [{}]
  };
  
  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;
  
  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = 'by-day';
    var point_interval =  86400000; // 1 day in ms
    var req_data = {
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    var suffix_text = 'by-week';
    var point_interval = 604800000; // 1 week in ms
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    var req_data = {
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
    };
  }
  
  options.chart.type = 'line';
  options.legend = {
    enabled: false,
  };
  options.plotOptions.series = {
    pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
    pointInterval: point_interval,
    connectNulls: true,
  };
  options.title.text = 'Root Zone Size ' + suffix_text;
  
  $.ajax({
    url: "/api/v1/zone-size",
    type: "GET",
    dataType: "json",
    data: req_data, 

    success: function(res){
      var rv = {};
      $.each(res['a'], function(date, serials) {
        if(date == null || date == 0){
          rv[date] = null;
        }else{
          if(serials == null || serials == 0){
            rv[date] = null;
          }else{
            rv[date] = Object.values(serials)[0];
          }
        }
      });

      var points = [];
      points[0] = {};
      points[0].name = 'Root Zone';
      points[0].data = Object.values(rv);
      
      options.series = points;
      new Highcharts.Chart(options);
  }});
}

