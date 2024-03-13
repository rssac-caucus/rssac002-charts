/* Copyright Andrew McConachie <andrew@depht.com> 2024 */

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
      enabled: false,
    },
    subtitle: {
      text: 'Source: https://root-servers.org'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: null
      },
    },
    yAxis: {
      title: {
        text: 'Instances'
      },
    },
    plotOptions: {
      series: {
        pointStart: Date.UTC('2015', '02', '02'),  // Jan is zero'th month in JS
        pointInterval: 86400000, // 1 day in ms
        connectNulls: true,
      },
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var ip_version = document.querySelector('input[name = "ip_version"]:checked').value;

  // Determine request JSONs
  var req_data = {
    rsi: 'a-m',
    start_date: '2015-03-02',
    end_date: end_date,
    sum: true,
  };
  
  if(ip_version == 'all'){
    options.title.text = 'All Instances';
  }else if(ip_version == 'dual'){
    options.title.text = 'Dual Stack Instances';
  }else if(ip_version == '4'){
      options.title.text = 'IPv4 Enabled Instances';
  }else{
    options.title.text = 'IPv6 Enabled Instances';
  }

  $.ajax({
    url: "/api/v1/instances-count",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      var totals = {};
      totals.data = [];
      $.each(res, function(date, _){
        if(ip_version == '4'){
          totals.data.push(res[date]['ipv4']);
        }else if(ip_version == '6'){
          totals.data.push(res[date]['ipv6']);
        }else if(ip_version =='dual'){
          totals.data.push(Math.min(res[date]['ipv4'], res[date]['ipv6']));
        }else{
          totals.data.push(Math.max(res[date]['ipv4'], res[date]['ipv6']));
        }
      });
      
      options.series.push(totals);
      new Highcharts.Chart(options);
    }});
}
