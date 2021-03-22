/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  var options = {
    chart: {
      renderTo: '',
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
      end_date: document.getElementById('end_date').textContent,
    },
    success: function(res){
      var udp_v4_points = [];
      var udp_v6_points = [];
      var tcp_v4_points = [];
      var tcp_v6_points = [];
      var ii = 0;

      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '01'); // Jan is zero'th month in JS
      $.each(res, function(rsi, dates) {
        udp_v4_points[ii] = {};
        udp_v4_points[ii].name = rsi;
        udp_v4_points[ii].data = [];

        tcp_v4_points[ii] = {};
        tcp_v4_points[ii].name = rsi;
        tcp_v4_points[ii].data = [];

        udp_v6_points[ii] = {};
        udp_v6_points[ii].name = rsi;
        udp_v6_points[ii].data = [];

        tcp_v6_points[ii] = {};
        tcp_v6_points[ii].name = rsi;
        tcp_v6_points[ii].data = [];

        $.each(dates, function(day, metrics) {
          if(metrics == null){
            udp_v4_points[ii].data.push(null);
            tcp_v4_points[ii].data.push(null);
            udp_v6_points[ii].data.push(null);
            tcp_v6_points[ii].data.push(null);
          }

          $.each(metrics, function(key, value) {
            if(key == 'dns-udp-queries-received-ipv4'){
              udp_v4_points[ii].data.push(value);
            }
            if(key == 'dns-tcp-queries-received-ipv4'){
              tcp_v4_points[ii].data.push(value);
            }
            if(key == 'dns-udp-queries-received-ipv6'){
              udp_v6_points[ii].data.push(value);
            }
            if(key == 'dns-tcp-queries-received-ipv6'){
              tcp_v6_points[ii].data.push(value);
            }
          });
        });
        ii += 1;
      });
      options.chart.renderTo = 'container_udpv4';
      options.title.text = 'IPv4 UDP Queries per-day (billion)';
      options.series = udp_v4_points;
      var udp_v4_chart = new Highcharts.Chart(options);

      options.chart.renderTo = 'container_tcpv4';
      options.title.text = 'IPv4 TCP Queries per-day (billion)';
      options.series = tcp_v4_points;
      var tcp_v4_chart = new Highcharts.Chart(options);

      options.chart.renderTo = 'container_udpv6';
      options.title.text = 'IPv6 UDP Queries per-day (billion)';
      options.series = udp_v6_points;
      var udp_v6_chart = new Highcharts.Chart(options);

      options.chart.renderTo = 'container_tcpv6';
      options.title.text = 'IPv6 TCP Queries per-day (billion)';
      options.series = tcp_v6_points;
      var tcp_v6_chart = new Highcharts.Chart(options);
    }});
});
