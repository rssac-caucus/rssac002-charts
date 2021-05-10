/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: '',
      type: 'line',
      zoomType: 'x'
    },
    title: {
        text: ''
    },
    legend: {
      enabled: true,
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
    plotOptions: {
      series:{
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
        connectNulls: true,
      },
    },
    series: [{}]
  };

  const min_time = 1; // The minimum allowed time in data
  const max_time = 86400; // The maximum allowed time in data
  options.yAxis.min = min_time;
  options.yAxis.max = max_time;

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var title_str = 'load-time by day';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    var title_str = 'load-time by week';
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
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

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/load-time",
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

        var points = [];
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

        options.chart.renderTo = 'container_' + rsi;
        options.title.text =  rsi + '.root-servers.net ' + title_str;
        options.series = points;
        new Highcharts.Chart(options);
      });
    }});
}
