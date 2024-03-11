/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

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
        connectNulls: true,
      }
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;
  var metric = document.querySelector('input[name = "metric"]:checked').value;
  const num_ranges = 8; // How many ranges to draw

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var denominator = 1;
    options.title.text = 'Top ' + num_ranges + ' ' + metric + ' per-day (billion)';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2019-01-07',
      end_date: end_date,
      sum: true,
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
      sum: true,
    };
  }

  $.ajax({
    url: "/api/v1/" + metric,
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){

      // Get totals for every range
      var range_totals = {};
      var date_totals = {};
      var all_data = {};
      $.each(res, function(date, ranges){
        all_data[date] = {};
        date_totals[date] = 0;
        $.each(ranges, function(range, count){
          all_data[date][range] = count;
          date_totals[date] += count;

          if(! (range in range_totals)){
            range_totals[range] = 0;
          }
          range_totals[range] += sum_vals(count);
        });
      });

      // Determine top num_ranges ranges to draw
      var top_ranges = [];
      ii = 0;
      while(Object.keys(range_totals).length > 0 && ii < num_ranges){
        highest = Object.keys(range_totals)[0];
        $.each(range_totals, function(range, count){
          if(count > range_totals[highest]){
            highest = range;
          }
        });
        top_ranges.push(highest);
        delete range_totals[highest];
        ii += 1;
      }
      top_ranges.sort(range_compare);

      var series_ranges = [];
      for(ii = 0; ii < top_ranges.length; ii++){
        var entry = {};
        entry.name = top_ranges[ii];
        entry.data = [];
        series_ranges.push(entry);
      }

      $.each(all_data, function(date, ranges){
        for(ii = 0; ii < series_ranges.length; ii++){
          if(series_ranges[ii].name in all_data[date]){
            series_ranges[ii].data.push(all_data[date][series_ranges[ii].name]);
          }else{
            series_ranges[ii].data.push(null);
          }
        }
      });

      options.series = series_ranges;
      new Highcharts.Chart(options);
    }});
};
