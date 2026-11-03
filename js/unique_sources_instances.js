/* Copyright Andrew McConachie <andrew@depht.com> 2024 2026 */

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
        text: 'Sources / Instances (log)'
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
  };
  var req_data_instances = Object.assign({}, req_data_sources); // deep copy

  if(time_interval == 'day'){
    var suffix_text = ' per-day';
    var denominator = 1;
    options.plotOptions.series.pointInterval = 86400000; // 1 day in ms
  }else{
    var suffix_text = ' by-week (daily average)';
    var denominator = 7;
    req_data_sources.week = true;
    req_data_instances.week = true;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
  }

  if(ip_version == '4'){
    options.title.text = 'Unique IPv4 Sources / IPv4 Enabled Instances ' + suffix_text;
  }else{ // IPv6
    options.title.text = 'Unique IPv6 (/64) Sources / IPv6 Enabled Instances ' + suffix_text;
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
            }else{
              sources[ii].data.push(Math.round(v_counts['num-sources-ipv6-aggregate'] / denominator));
            }
          }else{
            sources[ii].data.push(null);
          }
        });
        ii += 1;
      });

      $.ajax({
        url: "/api/v1/instances-count",
        type: "GET",
        dataType: "json",
        data: req_data_instances,
        success: function(res_instances){
          var instances = [];
          var ii = 0;
          $.each(res_instances, function(k_letter, v_res){
            instances[ii] = {};
            instances[ii].name = k_letter;
            instances[ii].data = [];
            $.each(v_res, function(k_date, v_counts){
              if(v_counts != null) {
                if(ip_version == '4'){
                  instances[ii].data.push(Math.round(v_counts['ipv4'] / denominator));
                }else{
                  instances[ii].data.push(Math.round(v_counts['ipv6'] / denominator));
                }
              }else{
                instances[ii].data.push(null);
              }
            });
            ii += 1;
          });

          // It's possible that one API call might return longer arrays than the other
          for(ii=0; ii < sources.length; ii++){
            if(sources[ii].data.length != instances[ii].data.length){
              var target = Math.min(sources[ii].data.length, instances[ii].data.length);
              while(sources[ii].data.length > target){
                sources[ii].data.pop();
              }
              while(instances[ii].data.length > target){
                instances[ii].data.pop();
              }
            }
          }

          var points = [];
          for(ii=0; ii < sources.length; ii++){
            points[ii] = {};
            points[ii].name = sources[ii].name;
            points[ii].data = [];
            for(jj=0; jj < sources[ii].data.length; jj++){
              points[ii].data.push(Math.round(sources[ii].data[jj] / instances[ii].data[jj]));
            }
          }

          options.series = points;
          new Highcharts.Chart(options);
        }});
    }});
}
