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
      renderTo: 'container',
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
        //pointInterval: 86400000, // 1 day in ms
        connectNulls: true,
      }
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;
  var metric = document.querySelector('input[name = "metric"]:checked').value;
  const num_ranges = 6; // How many ranges to draw

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2019-01-07',
      end_date: end_date,
    };
  }else{
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
    var tooltip = {
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
        $.each(dates, function(date, ranges){
          $.each(ranges, function(range, count){
            if(! (range in ranges_totals)){
              ranges_totals[range] = 0;
            }
            ranges_totals[range] += sum_vals(count);
          });
        });
      });

      // Determine top num_ranges ranges to draw
      var top_ranges = [];
      ii = 0;
      while(Object.keys(ranges_totals).length > 0 && ii < num_ranges){
        highest = Object.keys(ranges_totals)[0];
        $.each(ranges_totals, function(range, count){
          if(count > ranges_totals[highest]){
            highest = range;
          }
        });
        top_ranges.push(highest);
        delete ranges_totals[highest];
        ii += 1;
      }
      top_ranges.sort(range_compare);

      // Prepare chart data series for each range
      var chart_ranges = {};
      for(ii = 0; ii < top_ranges.length; ii++){ // Start with zeroes filling each series
        chart_ranges[top_ranges[ii]] = new Array(Object.keys(res[Object.keys(res)[0]]).length).fill(0);
      }
      $.each(res, function(_, dates){
        var ii = 0;
        $.each(dates, function(_, ranges){
          $.each(chart_ranges, function(range, _){
            if(ranges != null && ranges != 0){
              if(range in ranges){
                chart_ranges[range][ii] = sum_vals(chart_ranges[range][ii], ranges[range]);
              }
            }
          });
          ii += 1;
        });
      });

      // Convert chart_ranges to Highcharts series
      var series_ranges = [];
      $.each(chart_ranges, function(range, series){
        var entry = {};
        entry.name = range;
        entry.data = series;
        series_ranges.push(entry);
      });

      options.title.text = 'RSS ' + metric + ' ' + ' (top ' + num_ranges + ') ' +' (per-' + time_interval + ') (billion)';
      options.series = series_ranges;
      new Highcharts.Chart(options);
    }});
};
