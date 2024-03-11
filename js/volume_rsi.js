/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
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
    exporting: {
      filename: 'chart',
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

  // Read some values from the HTML
  var direction = document.getElementById('direction').textContent;
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var denominator = 1;
    options.plotOptions.area.pointInterval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    var denominator = 7;
    options.plotOptions.area.pointInterval = 604800000; // 1 week in ms
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
      week: true,
    };
  }

  if(direction == 'received'){
    var protocols = {
        'dns-udp-queries-received-ipv4': 'IPv4-UDP', 'dns-tcp-queries-received-ipv4': 'IPv4-TCP',
        'dns-udp-queries-received-ipv6': 'IPv6-UDP', 'dns-tcp-queries-received-ipv6': 'IPv6-TCP'
    };
    var title_str = 'queries';
    options.yAxis.title.text = title_str;
  }else{
    var protocols = {
        'dns-udp-responses-sent-ipv4': 'IPv4-UDP', 'dns-tcp-responses-sent-ipv4': 'IPv4-TCP',
        'dns-udp-responses-sent-ipv6': 'IPv6-UDP', 'dns-tcp-responses-sent-ipv6': 'IPv6-TCP'
    };
    var title_str = 'responses';
    options.yAxis.title.text = title_str;
  }

  $.ajax({
    url: "/api/v1/traffic-volume",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '02'); // Jan is zero'th month in JS
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
          if(protos == null || protos == 0){
            $.each(protocols, function(key, value) {
              queries_series[rsi][key].data.push(null);
            });
          }else{
            $.each(protos, function(prot, value){
              if(prot in protocols){
                queries_series[rsi][prot].data.push(Math.round(value / denominator));
              }
            });
          }
        });
        $.each(queries_series[rsi], function(proto, series_data) {
          chart_series[rsi].push(series_data);
        });
      });

      $.each(chart_series, function(rsi, protos){
        if(time_interval == 'day'){
          options.title.text =  rsi + '.root-servers.net ' + title_str + ' per-day (billion)';
        }else{
          options.title.text =  rsi + '.root-servers.net ' + title_str + ' by-week (billion) (daily-average)';
        }

        options.chart.renderTo = 'container_' + rsi;
        options.exporting.filename = options.title.text;
        options.series = protos;
        new Highcharts.Chart(options);
      });
    }
  });
}
