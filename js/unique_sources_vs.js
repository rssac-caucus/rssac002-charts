/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  var options = {
    chart: {
      renderTo: 'container',
      type: 'area',
      zoomType: 'x'
    },
    title: {
        text: 'Unique IP Source Addresses per-day'
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
    url: "/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: document.getElementById('end_date').textContent,
    },
    success: function(res){
      var totals_ipv4 = {};
      var totals_ipv6 = {};

      $.each(res, function(letter, dates) {
        $.each(dates, function(date, counts) {
          if(totals_ipv4[date] == null){
            totals_ipv4[date] = 0;
          }
          if(totals_ipv6[date] == null){
            totals_ipv6[date] = 0;
          }
          if(counts != null){
            if(counts['num-sources-ipv4'] != null){
              totals_ipv4[date] += counts['num-sources-ipv4'];
            }
            if(counts['num-sources-ipv6-aggregate'] != null){
              totals_ipv6[date] += counts['num-sources-ipv6-aggregate'];
            }
          }
        });
      });

      var points = [];
      points[0] = {};
      points[0].name = 'IPv4';
      points[0].data = Object.values(totals_ipv4);
      points[1] = {};
      points[1].name = 'IPv6 (/64)';
      points[1].data = Object.values(totals_ipv6);

      options.series = points;
      new Highcharts.Chart(options);
    }});
});
