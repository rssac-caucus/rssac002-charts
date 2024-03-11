/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
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
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
        connectNulls: true,
      },
    },
    series: [{}]
  };

  // Read some values from the HTML
  var direction = document.getElementById('direction').textContent;
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var denominator = 1;
    var suffix_text = ' per-day (billion)';
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      sum: true,
    };
  }else{
    var denominator = 7;
    var suffix_text = ' by-week (billion) (daily-average)';
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
      start_date: '2017-01-02',
      end_date: end_date,
      sum: true,
      week: true,
    };
  }

  if(direction == 'received'){
    var key_str = 'queries-received';
    var title_str = 'queries';
    options.yAxis.title.text = title_str;
  }else{
    var key_str = 'responses-sent';
    var title_str = 'responses';
    options.yAxis.title.text = title_str;
  }

  $.ajax({
    url: "/api/v1/traffic-volume",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      var udp_v4_points = {};
      var udp_v6_points = {};
      var tcp_v4_points = {};
      var tcp_v6_points = {};

      udp_v4_points.data = [];
      udp_v6_points.data = [];
      tcp_v4_points.data = [];
      tcp_v6_points.data = [];

      $.each(res, function(day, metrics) {
        if(metrics == null || metrics == 0){
          udp_v4_points.data.push(null);
          tcp_v4_points.data.push(null);
          udp_v6_points.data.push(null);
          tcp_v6_points.data.push(null);
        }

        $.each(metrics, function(key, value) {
          if(key == 'dns-udp-' + key_str + '-ipv4'){
            udp_v4_points.data.push(Math.round(value / denominator));
          }
          if(key == 'dns-tcp-' + key_str + '-ipv4'){
            tcp_v4_points.data.push(Math.round(value / denominator));
          }
          if(key == 'dns-udp-' + key_str + '-ipv6'){
            udp_v6_points.data.push(Math.round(value / denominator));
          }
          if(key == 'dns-tcp-' + key_str + '-ipv6'){
            tcp_v6_points.data.push(Math.round(value / denominator));
          }
        });
      });

      options.chart.renderTo = 'container_udpv4';
      options.title.text = 'IPv4 UDP ' + title_str + suffix_text;
      options.series = [udp_v4_points];
      new Highcharts.Chart(options);

      options.chart.renderTo = 'container_tcpv4';
      options.title.text = 'IPv4 TCP ' + title_str + suffix_text;
      options.series = [tcp_v4_points];
      new Highcharts.Chart(options);

      options.chart.renderTo = 'container_udpv6';
      options.title.text = 'IPv6 UDP ' + title_str + suffix_text;
      options.series = [udp_v6_points];
      new Highcharts.Chart(options);

      options.chart.renderTo = 'container_tcpv6';
      options.title.text = 'IPv6 TCP ' + title_str + suffix_text;
      options.series = [tcp_v6_points];
      new Highcharts.Chart(options);
    }
  });
}
