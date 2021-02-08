$(document).ready(function() {
  var options = {
    chart: {
      renderTo: 'container',
      type: 'line',
      zoomType: 'x'
    },
    title: {
        text: 'Responses Sent per-day (billion)'
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    legend: {
      enabled: false,
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
        connectNulls: true,
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
      totals: 'sent',
    },
    success: function(res){
      var totals = {}
      $.each(res, function(rsi, dates) {
        $.each(dates, function(date, value) {
          if(!(date in totals)){
            totals[date] = 0;
          }
          if(value != null){
            totals[date] += value;
          }
        });
      });

      var points = [];
      points[0] = {};
      points[0].name = 'RSS';
      points[0].data = Object.values(totals);

      options.series = points;
      new Highcharts.Chart(options);
    }});
});
