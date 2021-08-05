/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

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
      title: {
        text: 'seconds (log)'
      },
      type: 'logarithmic',
    },
    plotOptions: {},
    series: [{}]
  };

  const chart_type = 'line'; // We're hard setting it for now as boxplot is broken
  const min_time = 1; // The minimum allowed time in data
  const max_time = 86400; // The maximum allowed time in data
  options.yAxis.min = min_time;
  options.yAxis.max = max_time;

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  //var chart_type = document.querySelector('input[name = "chart_type"]:checked').value;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    options.title.text = 'RSS load-time by day';
    var point_interval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    options.title.text = 'RSS load-time by week';
    var point_interval = 604800000; // 1 week in ms
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
    };
  }

  // Set options based on chart_type
  if(chart_type == 'box'){
    options.chart.type = 'boxplot';
    options.legend = {
      enabled: false,
    };
    options.plotOptions.series = {
      pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
      pointInterval: point_interval,
    };
  }else{
    options.chart.type = 'line';
    options.legend = {
      enabled: true,
    };
    options.plotOptions.series = {
      pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
      pointInterval: point_interval,
      connectNulls: true,
    };
  }

  $.ajax({
    url: "/api/v1/load-time",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      var date_times = {};
      $.each(res, function(rsi, dates){
        $.each(dates, function(date, times){
          if( !(date in date_times)){
            date_times[date] = [];
          };

          if(times != null){
            $.each(times, function(time, val){
              if(val != null) {
                if(val >= min_time){
                  if(val <= max_time){
                    date_times[date].push(val);
                  }
                }
              }
            });
          }
        });
      });

      var points = [];
      if(chart_type == 'box'){
        points[0] = {};
        points[0].name = 'RSS';
        points[0].data = [];
        $.each(date_times, function(date, times){
          if(times.length == 0){
            points[0].data.push([null, null, null, null, null]);
          }else{
            var x = [];
            x[0] = Math.min.apply(null, (times));
            x[1] = quantile(times, 0.25);
            x[2] = quantile(times, 0.5);
            x[3] = quantile(times, 0.75);
            x[4] = Math.max.apply(null, (times));

            points[0].data.push(x);
            for(ii = 0; ii < 5; ii++){
              if(x[ii] < min_time || x[ii] === undefined){
                console.log(x[ii]);
              }
            }
          }
        });
      }else{
        points[0] = {};
        points[0].name = 'Min';
        points[0].data = [];

        points[1] = {};
        points[1].name = 'Quartile 1';
        points[1].data = [];

        points[2] = {};
        points[2].name = 'Mean';
        points[2].data = [];

        points[3] = {};
        points[3].name = 'Quartile 3';
        points[3].data = [];

        points[4] = {};
        points[4].name = 'Max';
        points[4].data = [];

        $.each(date_times, function(date, times){
          if(times.length == 0){
            points[0].data.push(null);
            points[1].data.push(null);
            points[2].data.push(null);
            points[3].data.push(null);
            points[4].data.push(null);
          }else{
            points[0].data.push(Math.min.apply(null, (times)));
            points[1].data.push(quantile(times, 0.25));
            points[2].data.push(quantile(times, 0.5));
            points[3].data.push(quantile(times, 0.75));
            points[4].data.push(Math.max.apply(null, (times)));
          }
        });
      }

      options.series = points;
      new Highcharts.Chart(options);
    }});
}
