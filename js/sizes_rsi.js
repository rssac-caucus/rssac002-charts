/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  rssac002_update_chart();
});

// Compare function for sorting ranges
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function range_compare(a, b){
  if(Number(a.split("-")[0]) < Number(b.split("-")[0])){
    return -1;
  }else if(Number(a.split("-")[0]) == Number(b.split("-")[0])){
    return 0;
  }else{
    return 1;
  }
}

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
        text: 'packets (log)'
      },
      type: 'logarithmic',
      labels: {
        formatter: function () {
          return this.value / 1000000000;
        }
      },
    },
    plotOptions: {
      series: {
        pointStart: Date.UTC('2019', '00', '07'),  // Jan is zero'th month in JS
        connectNulls: true,
      }
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;
  var metric = document.querySelector('input[name = "metric"]:checked').value;
  var num_ranges = document.querySelector('input[name = "num_sizes"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var denominator = 1;
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2019-01-07',
      end_date: end_date,
    };
  }else{
    var denominator = 7;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
    var tooltip = {
      valueDecimals: 0,
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    var req_data = {
      rsi: 'a-m',
      start_date: '2019-01-07',
      end_date: end_date,
      week: true,
    };
  }

  $.ajax({
    url: "/api/v1/" + metric,
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){

      // Get totals for every range
      var ranges_totals = {}
      $.each(res, function(rsi, dates){
        ranges_totals[rsi] = {};
        $.each(dates, function(date, ranges){
          $.each(ranges, function(range, count){
            if(! (range in ranges_totals[rsi])){
              ranges_totals[rsi][range] = 0;
            }
            ranges_totals[rsi][range] += count;
          });
        });
      });

      // Determine top num_ranges ranges to draw
      var top_ranges = {};
      $.each(ranges_totals, function(rsi, ranges){
        top_ranges[rsi] = [];
        ii = 0;
        while(ranges && ii < num_ranges){
          highest = Object.keys(ranges)[0];
          $.each(ranges, function(range, count){
            if(count > ranges[highest]){
              highest = range;
            }
          });
          top_ranges[rsi].push(highest);
          delete ranges[highest];
          ii += 1;
        }
        top_ranges[rsi].sort(range_compare);
      });

      // Prepare chart data series
      var chart_series = {};
      $.each(res, function(rsi, dates){
        ranges = {};
        for(ii = 0; ii < top_ranges[rsi].length; ii++){
          ranges[top_ranges[rsi][ii]] = [];
        }
        $.each(dates, function(date, sizes){
          $.each(ranges, function(range, data){
            if(sizes == null || sizes == 0){
              data.push(null);
            }else if(range in sizes){
              data.push(Math.round(sizes[range] / denominator));
            }else{
              data.push(null);
            }
          });
        });

        chart_series[rsi] = [];
        $.each(ranges, function(range, data){
          var entry = {};
          entry.name = range;
          entry.data = data;
          chart_series[rsi].push(entry);
        });
      });

      $.each(chart_series, function(rsi, ranges){
        options.chart.renderTo = 'container_' + rsi;
        if(time_interval == 'day'){
          options.title.text =  rsi + '.root-servers.net top ' + num_ranges + ' ' + metric + ' per-day (billion)';
        }else{
          options.title.text =  rsi + '.root-servers.net top ' + num_ranges + ' ' + metric + ' by-week (billion) (daily-average)';
        }
        options.series = ranges;
        new Highcharts.Chart(options);
      });
    }
  });
}
