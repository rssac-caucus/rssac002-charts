/* Copyright Andrew McConachie <andrew@depht.com> 2022 2024 */

/* This script is currently not used. 
Looks like I developed this in March of 2022 and then abandoned it because I didn't have time.
I will revisit this at a later date because I like the idea of this.
*/

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
        text: 'packets %'
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
  const num_ranges = 10; // How many ranges to draw

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var denominator = 1;
    options.title.text = 'Top ' + num_ranges + ' ' + metric + ' per-day (billion)';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2019-01-07',
      end_date: end_date,
    };
  }else{
    var denominator = 7;
    options.title.text = 'Top ' + num_ranges + ' ' + metric + ' by-week (billion) (daily average)';
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

      // Get totals for every time_interval and every range
      var date_totals = {}
      var ranges_totals = {};
      $.each(res, function(rsi, dates){
        $.each(dates, function(date, ranges){
          if(! (date in date_totals)){
            date_totals[date] = 0;
          }
          $.each(ranges, function(range, count){
            date_totals[date] += sum_vals(count);

            if(! (range in ranges_totals)){
              ranges_totals[range] = 0;
            }
            ranges_totals[range] += sum_vals(count);
          });
        });
      });
      var date_totals = Object.values(date_totals); // We need this as an array

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
        $.each(dates, function(date, ranges){
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

      // Change counts to percents
      $.each(chart_ranges, function(range, dates){
        for(ii = 0; ii < date_totals.length; ii++){
          chart_ranges[range][ii] = Math.round(chart_ranges[range][ii] / date_totals[ii]);
        }
      });

      // Convert chart_ranges to Highcharts series
      var series_ranges = [];
      $.each(chart_ranges, function(range, series){
        var entry = {};
        entry.name = range;
        entry.data = series;
        series_ranges.push(entry);
      });

      options.series = series_ranges;
      new Highcharts.Chart(options);
    }});
};
