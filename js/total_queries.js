/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  var options = {
    chart: {
      renderTo: '',
      type: '',
      zoomType: 'x'
    },
    title: {
        text: 'Queries Received per-day (billion)'
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
        text: 'Queries'
      },
      labels: {
        formatter: function () {
          return this.value / 1000000000;
        }
      }
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      },
      series: {
        pointStart: Date.UTC('2017', '00', '01'),  // Jan is zero'th month in JS
        pointInterval: 86400000, // 1 day in ms
      },
    },
    series: [{}]
  };

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/traffic-volume",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: document.getElementById('end_date').textContent,
      totals: 'received',
    },
    success: function(res){
      var points = [];
      var ii = 0;

      $.each(res, function(k_res, v_res) {
        points[ii] = {};
        points[ii].name = k_res;
        points[ii].data = [];
        $.each(v_res, function(key, val) {
          points[ii].data.push(val);
        });
        ii += 1;
      });
      options.series = points;

      options.chart.renderTo = 'container_area';
      options.chart.type = 'area';
      new Highcharts.Chart(options);

      options.chart.renderTo = 'container_line';
      options.chart.type = 'line';
      options.plotOptions.series.connectNulls = true;
      new Highcharts.Chart(options);
    }});
});
