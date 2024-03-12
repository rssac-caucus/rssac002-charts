/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

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
        text: 'Queries / Sources (log)'
      },
      type: 'logarithmic',
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

  // Determine request JSONs
  var req_data_sources = {
    rsi: 'a-m',
    start_date: '2017-01-02',
    end_date: end_date,
    sum: true,
  };
  var req_data_queries = Object.assign({}, req_data_sources); // deep copy
  if(time_interval == 'day'){
    var suffix_text = ' per-day';
    options.plotOptions.series.pointInterval = 86400000; // 1 day in ms
  }else{
    var suffix_text = ' by-week (daily average)';
    req_data_sources.week = true;
    req_data_queries.week = true;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
  }

  if(ip_version == '4'){
    options.title.text = 'IPv4 Queries Received / Unique IPv4 Sources' + suffix_text;
    var s_keys = ['num-sources-ipv4'];
    var q_keys = ['dns-udp-queries-received-ipv4', 'dns-tcp-queries-received-ipv4'];
  }else if(ip_version == '6'){
    options.title.text = 'IPv6 Queries Received / Unique IPv6 (/64) Sources' + suffix_text;
    var s_keys = ['num-sources-ipv6-aggregate'];
    var q_keys = ['dns-udp-queries-received-ipv6', 'dns-tcp-queries-received-ipv6'];
  }else{ // both
    options.title.text = 'Queries Received / Unique Sources' + suffix_text;
    var s_keys = ['num-sources-ipv4', 'num-sources-ipv6-aggregate'];
    var q_keys = ['dns-udp-queries-received-ipv4', 'dns-tcp-queries-received-ipv4',
                  'dns-udp-queries-received-ipv6', 'dns-tcp-queries-received-ipv6'];
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
        if(val != null){
          for(jj=0; jj < s_keys.length; jj++){
            sources[ii] += sum_vals(val[s_keys[jj]]);
          }
        }else{
          sources[ii] = 1; // This should never happen
        }
        ii++;
      });

      $.ajax({
        url: "/api/v1/traffic-volume",
        type: "GET",
        dataType: "json",
        data: req_data_queries,
        success: function(res_queries){
          var queries = [];
          var ii = 0;
          $.each(res_queries, function(date, val){
            queries[ii] = 0;
            if(val != null){
              for(jj=0; jj < q_keys.length; jj++){
                queries[ii] += sum_vals(val[q_keys[jj]]);
              }
            }else{
              queries[ii] = 1; // This should never happen
            }
            ii++;
          });

          var points = {};
          points.data = [];
          for(ii=0; ii < sources.length; ii++){
            points.data.push(Math.round(queries[ii] / sources[ii]));
          }
          options.series.push(points);
          new Highcharts.Chart(options);
        }});
    }});
}
