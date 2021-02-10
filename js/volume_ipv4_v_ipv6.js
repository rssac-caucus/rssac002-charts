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
        text: '%'
      },
      labels: {
        formatter: function () {
          return this.value + '%';
        }
      }
    },
    plotOptions: {
      area: {
        stacking: 'percent',
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
        events: {
          legendItemClick: function() {
            return false;
          }
        }
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
    },
    success: function(res){
      var direction = document.getElementById('direction').textContent;
      var v4_points = {};
      var v6_points = {};

      // Get totals per-day
      $.each(res, function(rsi, dates) {
        $.each(dates, function(day, metrics) {
          if(!(day in v4_points)){
            v4_points[day] = 0;
          }
          if(!(day in v6_points)){
            v6_points[day] = 0;
          }

          $.each(metrics, function(key, value) {
            if(direction == 'received'){
              if(key == 'dns-udp-queries-received-ipv6'){
                v6_points[day] += value;
              }
              if(key == 'dns-udp-queries-received-ipv4'){
                v4_points[day] += value;
              }
              if(key == 'dns-tcp-queries-received-ipv4'){
                v4_points[day] += value;
              }
              if(key == 'dns-tcp-queries-received-ipv6'){
                v6_points[day] += value;
              }
            }else{
              if(key == 'dns-udp-responses-sent-ipv6'){
                v6_points[day] += value;
              }
              if(key == 'dns-udp-responses-sent-ipv4'){
                v4_points[day] += value;
              }
              if(key == 'dns-tcp-responses-sent-ipv4'){
                v4_points[day] += value;
              }
              if(key == 'dns-tcp-responses-sent-ipv6'){
                v6_points[day] += value;
              }
            }
          });
        });
      });

      var points = [];
      points[0] = {};
      points[0].name = 'IPv4';
      points[0].data = Object.values(v4_points);
      points[1] = {};
      points[1].name = 'IPv6';
      points[1].data = Object.values(v6_points);

      if(direction == 'received'){
        options.title.text = 'IPv4 vs IPv6 Queries per-day';
      }else{
        options.title.text = 'IPv4 vs IPv6 Responses per-day';
      }
      options.series = points;
      new Highcharts.Chart(options);
    }});
});
