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
        text: 'Sources / Instances (log)'
      },
      type: 'logarithmic',
    },
    plotOptions: {
      series: {
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
        connectNulls: true,
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
  var req_data_sources = {
    rsi: 'a-m',
    start_date: '2017-01-02',
    end_date: end_date,
    sum: true,
  };
  var req_data_instances = Object.assign({}, req_data_sources); // deep copy

  if(ip_version == '4'){
    options.title.text = 'Unique IPv4 Sources / IPv4 Enabled Instances per-day';
    var s_key = 'num-sources-ipv4';
    var i_key = 'ipv4';
  }else{ // IPv6
    options.title.text = 'Unique IPv6 (/64) Sources / IPv6 Enabled Instances per-day';
    var s_key = 'num-sources-ipv6-aggregate';
    var i_key = 'ipv6';
  }

  $.ajax({
    url: "/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: req_data_sources,
    success: function(res_sources){
      var sources = [];
      var ii = 0;
      $.each(res_sources, function(date, val){
        sources[ii] = 0;
        if(val == null){
          sources[ii] = null;
        }else{
          sources[ii] += sum_vals(val[s_key]);
        }
        ii++;
      });

      $.ajax({
        url: "/api/v1/instances-count",
        type: "GET",
        dataType: "json",
        data: req_data_instances,
        success: function(res_instances){
          var instances = [];
          var ii = 0;
          $.each(res_instances, function(date, val){
            instances[ii] = 0;
            if(val == null){
              instances[ii] = null;
            }else{
              instances[ii] += sum_vals(val[i_key]);
            }
            ii++;
          });

          var points = {};
          points.data = [];
          points.name = options.title.text;
          for(ii=0; ii < sources.length; ii++){
            if(sources[ii] == null || instances[ii] == null){
              points.data.push(null);
            }else{
              points.data.push(Math.round(sources[ii] / instances[ii]));
            }
          }
          options.series = [points];
          new Highcharts.Chart(options);
        }});
    }});
}
