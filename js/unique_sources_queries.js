/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 2026 */

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
    end_date: end_date
  };
  var req_data_queries = Object.assign({}, req_data_sources); // deep copy

  if(time_interval == 'day'){
    var suffix_text = ' per-day';
    var denominator = 1;
    options.plotOptions.series.pointInterval = 86400000; // 1 day in ms
  }else{
    var suffix_text = ' by-week (daily average)';
    var denominator = 7;
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
  }else if(ip_version == '6'){
    options.title.text = 'IPv6 Queries Received / Unique IPv6 (/64) Sources' + suffix_text;
  }else{ // both
    options.title.text = 'Queries Received / Unique Sources' + suffix_text;
  }

  $.ajax({
    url: "/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: req_data_sources,
    success: function(res_sources){
      var sources = [];
      var ii = 0;
      $.each(res_sources, function(k_letter, v_res){
        sources[ii] = {};
        sources[ii].name = k_letter;
        sources[ii].data = [];
        $.each(v_res, function(k_date, v_counts){
          if(v_counts != null) {
            if(ip_version == '4'){
              sources[ii].data.push(Math.round(v_counts['num-sources-ipv4'] / denominator));
            }else if(ip_version == '6'){
              sources[ii].data.push(Math.round(v_counts['num-sources-ipv6-aggregate'] / denominator));
            }else{
              sources[ii].data.push(point = Math.round(sum_vals(v_counts['num-sources-ipv4'], v_counts['num-sources-ipv6-aggregate']) / denominator));
            }
          }else{
            sources[ii].data.push(null);
          }
        });
        ii += 1;
      });

      $.ajax({
        url: "/api/v1/traffic-volume",
        type: "GET",
        dataType: "json",
        data: req_data_queries,
        success: function(res_queries){
          var queries = [];
          var ii = 0;
          $.each(res_queries, function(k_letter, v_res){
            queries[ii] = {};
            queries[ii].name = k_letter;
            queries[ii].data = [];
            $.each(v_res, function(k_date, v_tot){
              if(v_tot != null){
                if(ip_version == '4'){
                  queries[ii].data.push(Math.round(sum_vals(
                    v_tot['dns-tcp-queries-received-ipv4'], v_tot['dns-tcp-queries-received-ipv4']) / denominator));
                }else if(ip_version == '6'){
                  queries[ii].data.push(Math.round(sum_vals(
                    v_tot['dns-tcp-queries-received-ipv6'], v_tot['dns-tcp-queries-received-ipv6']) / denominator));
                }else{
                  queries[ii].data.push(Math.round(sum_vals(
                    v_tot['dns-tcp-queries-received-ipv4'], v_tot['dns-tcp-queries-received-ipv4'],
                    v_tot['dns-tcp-queries-received-ipv6'], v_tot['dns-tcp-queries-received-ipv6']) / denominator));
                }
              }else{
                queries[ii].data.push(null);
              }
            });
            ii += 1;
          });

          // It's possible that one API call might return longer arrays than the other
          for(ii=0; ii < sources.length; ii++){
            if(sources[ii].data.length != queries[ii].data.length){
              var target = Math.min(sources[ii].data.length, queries[ii].data.length);
              while(sources[ii].data.length > target){
                sources[ii].data.pop();
              }
              while(queries[ii].data.length > target){
                queries[ii].data.pop();
              }
            }
          }

          var points = [];
          for(ii=0; ii < sources.length; ii++){
            points[ii] = {};
            points[ii].name = sources[ii].name;
            points[ii].data = [];
            for(jj=0; jj < sources[ii].data.length; jj++){
              points[ii].data.push(Math.round(queries[ii].data[jj] / sources[ii].data[jj]));
            }
          }

          options.series = points;
          new Highcharts.Chart(options);
        }});
    }});
}
