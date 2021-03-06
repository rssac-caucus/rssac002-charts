/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: 'container',
      type: 'line',
      zoomType: 'x'
    },
    title: {
        text: ''
    },
    legend: {
      enabled: true,
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
      series: {
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
        connectNulls: true,
      },
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;
  var ip_version = document.querySelector('input[name = "ip_version"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = ' per-day (million)';
    var denominator = 1;
    options.plotOptions.series.pointInterval = 86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    var suffix_text = ' by-week (million) (daily average)';
    var denominator = 7;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
    var tooltip = {
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

  if(ip_version == '4'){
    options.title.text = 'Unique IPv4 Sources' + suffix_text;
  }else if(ip_version == '6'){
    options.title.text = 'Unique IPv6 (/64) Sources' + suffix_text;
  }else{ // both
    options.title.text = 'Unique IPv4 + IPv6 (/64) Sources' + suffix_text;
  }

  $.ajax({
    url: "/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      var points = [];
      var ii = 0;
      $.each(res, function(rsi, dates){
        points[ii] = {};
        points[ii].name = rsi;
        points[ii].data = [];
        $.each(dates, function(key, val){
          if(val != null) {
            if(ip_version == '4'){
              points[ii].data.push(Math.round(sum_vals(val['num-sources-ipv4']) / denominator));
            }else if(ip_version == '6'){
              points[ii].data.push(Math.round(sum_vals(val['num-sources-ipv6-aggregate']) / denominator));
            }else{
              points[ii].data.push(Math.round(sum_vals(val['num-sources-ipv4'], val['num-sources-ipv6-aggregate']) / denominator));
            }
          }else{
            points[ii].data.push(null);
          }
        });
        ii += 1;
      });

      options.series = points;
      new Highcharts.Chart(options);
    }});
}
