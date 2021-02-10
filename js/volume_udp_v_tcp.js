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
        text: ''
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
      var udp_points = {};
      var tcp_points = {};

      // Get totals per-day
      $.each(res, function(rsi, dates) {
        $.each(dates, function(day, metrics) {
          if(!(day in udp_points)){
            udp_points[day] = 0;
          }
          if(!(day in tcp_points)){
            tcp_points[day] = 0;
          }

          $.each(metrics, function(key, value) {
            if(direction == 'received'){
              if(key == 'dns-udp-queries-received-ipv6'){
                udp_points[day] += value;
              }
              if(key == 'dns-udp-queries-received-ipv4'){
                udp_points[day] += value;
              }
              if(key == 'dns-tcp-queries-received-ipv4'){
                tcp_points[day] += value;
              }
              if(key == 'dns-tcp-queries-received-ipv6'){
                tcp_points[day] += value;
              }
            }else{
              if(key == 'dns-udp-responses-sent-ipv6'){
                udp_points[day] += value;
              }
              if(key == 'dns-udp-responses-sent-ipv4'){
                udp_points[day] += value;
              }
              if(key == 'dns-tcp-responses-sent-ipv4'){
                tcp_points[day] += value;
              }
              if(key == 'dns-tcp-responses-sent-ipv6'){
                tcp_points[day] += value;
              }
            }
          });
        });
      });

      var points = [];
      points[0] = {};
      points[0].name = 'UDP';
      points[0].data = Object.values(udp_points);
      points[1] = {};
      points[1].name = 'TCP';
      points[1].data = Object.values(tcp_points);

      if(direction == 'received'){
        options.title.text = 'UDP vs TCP Queries per-day';
      }else{
        options.title.text = 'UDP vs TCP Responses per-day';
      }
      options.series = points;
      new Highcharts.Chart(options);
    }});
});
