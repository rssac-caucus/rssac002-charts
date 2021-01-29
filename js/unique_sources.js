$(document).ready(function() {
  var options = {
    chart: {
      renderTo: 'container',
      type: 'area',
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
        text: 'IP Addresses'
      },
      labels: {
        formatter: function () {
          return this.value / 1000000;
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
    url: "http://rssac002.depht.com/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: '2020-12-31',
    },
    success: function(res){
      var ip_version = document.getElementById('ip_version').textContent;
      var points = [];
      var ii = 0;
      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '01'); // Jan is zero'th month in JS
      $.each(res, function(k_res, v_res) {
        points[ii] = {};
        points[ii].name = k_res;
        points[ii].data = [];
        $.each(v_res, function(key, val) {
          if(val != null) {
            points[ii].data.push(val['num-sources-ipv' + ip_version]);
          }else{
            points[ii].data.push(null);
          }
          });
        ii += 1;
      });
      options.series = points;
      options.title.text = 'Unique IPv' + ip_version + ' Sources per-day (millions)';

      var chart = new Highcharts.Chart(options);
    }});
});
