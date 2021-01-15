$(document).ready(function() {
  var options = {
    chart: {
      renderTo: 'container',
      type: 'area'
    },
    title: {
        text: 'Total Queries by RSI'
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    xAxis: {
      tickmarkPlacement: 'on',
      title: {
        enabled: false
      }
    },
    yAxis: {
      title: {
        text: 'Queries'
      },
      labels: {
        formatter: function () {
          return this.value * 1000;
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
      }
    },
    series: [{}]
  };

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/traffic-volume",
    type: "GET",
    dataType: "json",
    data: {
      letters: 'a-m',
      start_date: '2017-01-01',
      end_date: '2020-01-01',
      totals: 1,
      divisor: 1000
    },
    success: function(res){
      var x_ticks = [];
      var vals = [];
      var ii = 0;
      $.each(res, function(k_res, v_res) {
        vals[ii] = {};
        vals[ii].name = k_res;
        vals[ii].data = [];
        $.each(v_res, function(key, val) {
          vals[ii].data.push(val);
          if(ii == 0){
            x_ticks.push(key);
          }
        });
        ii += 1;
      });
      options.series = vals;
      options.xAxis.categories = x_ticks;

      var chart = new Highcharts.Chart(options);
    }});
});
