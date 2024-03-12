/* Copyright Andrew McConachie <andrew@depht.com> 2024 */

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
      text: '',
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
      title: {
        text: ''
      },
      labels: {
        formatter: function () {
          return this.value + '%';
        }
      }
    },
    legend: {
      enabled: false,
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

  const min_time = 1; // The minimum allowed time in data
  const max_time = 86400; // The maximum allowed time in data

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var threshold = document.getElementById('threshold').value;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = threshold + ' seconds by day (%)';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
    options.title.text = 'load-times under ' + threshold + ' seconds per-day (%)';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
  }else{
    var suffix_text = threshold + ' seconds by week (%)';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
    };
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    options.title.text = 'load-times under ' + threshold + ' seconds per-week (%)';
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
  }

  $.ajax({
    url: "/api/v1/load-time",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      var vals_above = [];
      var vals_below = [];
      $.each(res, function(rsi, dates){
        var ii = 0;
        $.each(dates, function(date, times){
          if( !(ii in vals_above)){
            vals_above[ii] = 0;
          }
          if( !(ii in vals_below)){
            vals_below[ii] = 0;
          }

          if(times != null){
            $.each(times, function(time, val){
              if(val != null) {
                if(val >= min_time && val <= max_time){
                  //console.log(val);
                  if(val <= threshold){
                    vals_below[ii] += 1;
                  }else{
                    vals_above[ii] += 1;
                  }
                }
              }
            });
          }
          ii++;
        });
      });

      var p_above = {};
      var p_below = {};
      p_above.data = vals_above;
      p_below.data = vals_below;
      options.series = [p_above, p_below];
      new Highcharts.Chart(options);
    }});
}
