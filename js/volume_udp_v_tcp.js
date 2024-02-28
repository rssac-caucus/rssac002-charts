/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
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

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var direction = document.getElementById('direction').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = 'day';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      sum: true,
    };
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
  }else{
    var suffix_text = 'week';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
      sum: true,
    };
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
  }

  $.ajax({
    url: "/api/v1/traffic-volume",
    type: "GET",
    dataType: "json",
    data: req_data,

    success: function(res){
      var udp_points = {};
      var tcp_points = {};

      $.each(res, function(date, metrics) {
        if(!(date in udp_points)){
          udp_points[date] = 0;
        }
        if(!(date in tcp_points)){
          tcp_points[date] = 0;
        }

        $.each(metrics, function(key, value) {
          if(direction == 'received'){
            if(key == 'dns-udp-queries-received-ipv6'){
              udp_points[date] += value;
            }
            if(key == 'dns-udp-queries-received-ipv4'){
              udp_points[date] += value;
            }
            if(key == 'dns-tcp-queries-received-ipv4'){
              tcp_points[date] += value;
            }
            if(key == 'dns-tcp-queries-received-ipv6'){
              tcp_points[date] += value;
            }
          }else{
            if(key == 'dns-udp-responses-sent-ipv6'){
              udp_points[date] += value;
            }
            if(key == 'dns-udp-responses-sent-ipv4'){
              udp_points[date] += value;
            }
            if(key == 'dns-tcp-responses-sent-ipv4'){
              tcp_points[date] += value;
            }
            if(key == 'dns-tcp-responses-sent-ipv6'){
              tcp_points[date] += value;
            }
          }
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
        options.title.text = 'UDP vs TCP Queries per-' + suffix_text;
      }else{
        options.title.text = 'UDP vs TCP Responses per-' + suffix_text;
      }
      options.series = points;
      new Highcharts.Chart(options);
    }});
}
