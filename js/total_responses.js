$(document).ready(function() {
  var options = {
    chart: {
      renderTo: 'container',
      type: 'area',
      zoomType: 'x'
    },
    title: {
        text: 'Responses Sent per-day (billion)'
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
        text: 'Responses'
      },
      labels: {
        formatter: function () {
          return this.value / 1000000000;
        }
      }
    },
    plotOptions: {
      area: {
        pointInterval: 86400000, // 1 day in ms
        stacking: 'normal',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      }
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
      end_date: '2020-12-31',
      totals: 'sent',
      //divisor: 1000
    },
    success: function(res){
      var points = [];
      var ii = 0;
      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '01'); // Jan is zero'th month in JS
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

      var chart = new Highcharts.Chart(options);
    }});
});
