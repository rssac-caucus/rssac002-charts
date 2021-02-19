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

$(document).ready(function() {
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
        text: ''
      },
      labels: {
        formatter: function () {
          return this.value / 1000000000;
        }
      }
    },
    plotOptions: {
      series: {
        pointStart: Date.UTC('2017', '00', '01'),  // Jan is zero'th month in JS
        pointInterval: 86400000, // 1 day in ms
        connectNulls: true,
      }
    },
    series: [{}]
  };

  var metric = document.getElementById('metric').textContent;
  $.ajax({
    url: "http://rssac002.depht.com/api/v1/" + metric,
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: document.getElementById('end_date').textContent,
    },
    success: function(res){
      var num_ranges = 10; // How many ranges to draw for each chart

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
            if(sizes == null){
              data.push(null);
            }else if(range in sizes){
              data.push(sizes[range]);
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
        options.title.text =  rsi + '.root-servers.net ' + metric + ' ' + ' (top ' + num_ranges + ') ' +' (per-day) (billion)';
        options.series = ranges;
        new Highcharts.Chart(options);
      });
    }});
});
