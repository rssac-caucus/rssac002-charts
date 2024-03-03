/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: 'container',
      type: 'area',
      zoomType: 'x'
    },
    title: {
        text: 'NoError vs NxDomain by-'
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: ''
      },
      labels: {
        formatter: function () {
          return this.value + '%';
        }
      }
    },
    plotOptions: {
      area: {
        stacking: 'percent',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      },
      series: {
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
        events: {
          legendItemClick: function() {
            return false;
          }
        }
      },
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      sum: true,
    };
    options.title.text += 'day';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
  }else{
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
      sum: true,
    };
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    options.title.text += 'week';
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
  }

  $.ajax({
    url: "/api/v1/rcode-volume",
    type: "GET",
    dataType: "json",
    data: req_data,

    success: function(res){
      var totals_0 = {};
      var totals_3 = {};
      var totals_other = {}

      $.each(res, function(date, counts) {
        if(totals_0[date] == null){
          totals_0[date] = 0;
        }
        if(totals_3[date] == null){
          totals_3[date] = 0;
        }
        if(totals_other[date] == null){
          totals_other[date] = 0;
        }

        if(counts != null){
          if(counts['0'] != null){
            totals_0[date] += counts['0'];
          }
          if(counts['3'] != null){
            totals_3[date] += counts['3'];
          }
          $.each(counts, function(key, val){
            if(key != '0' && key != '3'){
              if(val != null){
                totals_other[date] += val;
              }
            }
          });
        }
      });

      var points = [];
      points[0] = {};
      points[0].name = 'NoError';
      points[0].data = Object.values(totals_0);
      points[1] = {};
      points[1].name = 'NxDomain';
      points[1].data = Object.values(totals_3);
      points[2] = {};
      points[2].name = 'Other';
      points[2].data = Object.values(totals_other);

      options.series = points;
      new Highcharts.Chart(options);
    }});
};
