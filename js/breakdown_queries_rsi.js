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
      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '01'); // Jan is zero'th month in JS
      var protocols = {
        'dns-udp-queries-received-ipv4': 'IPv4-UDP', 'dns-tcp-queries-received-ipv4': 'IPv4-TCP',
        'dns-udp-queries-received-ipv6': 'IPv6-UDP', 'dns-tcp-queries-received-ipv6': 'IPv6-TCP'
      };
      var queries_series = {};
      var chart_series = {};

      $.each(res, function(rsi, dates) {
        queries_series[rsi] = {};
        chart_series[rsi] = [];

        $.each(protocols, function(key, value){
          queries_series[rsi][key] = {};
          queries_series[rsi][key].name = value;
          queries_series[rsi][key].data = [];
        });

        $.each(dates, function(date, protos) {
          if(protos == null) {
            $.each(protocols, function(key, value) {
              queries_series[rsi][key].data.push(null);
            });
          }else{
            $.each(protos, function(prot, value){
              if(prot in protocols){
                //console.log('prot:' + prot + ' value:' + value);
                queries_series[rsi][prot].data.push(value);
              }
            });
          }
        });
        $.each(queries_series[rsi], function(proto, series_data) {
          chart_series[rsi].push(series_data);
        });
      });

      $.each(chart_series, function(rsi, protos){
        options.chart.renderTo = 'container_' + rsi;
        options.title.text =  rsi + '.root-servers.net Queries Received per-day (billion)';
        options.series = protos;
        new Highcharts.Chart(options);
      });
    }});
});
