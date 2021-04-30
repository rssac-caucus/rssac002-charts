/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

// Summation function for dirty data
// Treat null as zero and ignore non-numbers
function sum_nulls(){
  var rv = 0;
  for(var ii = 0; ii < arguments.length; ii++){
    if(arguments[ii] != null){
      if(typeof(arguments[ii]) == 'number'){
        rv += arguments[ii];
      }
    }
  }
  return rv;
}

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: 'container',
      type: '',
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
        text: 'IP Addresses'
      },
      labels: {
        formatter: function () {
          return this.value / 1000000;
        }
      }
    },
    plotOptions: {},
    series: [{}]
  };

  // Read some values from the HTML
  var ip_version = document.getElementById('ip_version').textContent;
  var end_date = document.getElementById('end_date').textContent;
  var chart_type = document.querySelector('input[name = "chart_type"]:checked').value;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = '';
    var denominator = 1;
    var point_interval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
  }else{
    var suffix_text = '(daily average)';
    var denominator = 7;
    var point_interval = 604800000; // 1 week in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
    };
  }

  // Set options based on chart_type
  if(chart_type == 'stacked'){
    options.chart.type = 'area';
    var area = {
      pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
      pointInterval: point_interval,
      stacking: 'normal',
      lineColor: '#666666',
      lineWidth: 1,
      marker: {
        lineWidth: 1,
        lineColor: '#666666'
      }
    };
    options.plotOptions.area = area;
  }else{
    options.chart.type = 'line';
    options.legend = {
      enabled: false,
    };
    options.plotOptions.series = {
      pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
      pointInterval: point_interval,
      connectNulls: true,
    };
  }

  if(ip_version == '4' || ip_version == '6'){
    options.title.text = 'Unique IPv' + ip_version + ' Sources by-' + time_interval + ' (million) ' + suffix_text;
  }else{
    options.title.text = 'Unique IPv4 and IPv6 Sources by-' + time_interval + ' (million) ' + suffix_text;
  }

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/unique-sources",
    type: "GET",
    dataType: "json",
    data: req_data,
    success: function(res){
      if(chart_type == 'stacked'){
        var points = [];
        var ii = 0;
        $.each(res, function(k_res, v_res){
          points[ii] = {};
          points[ii].name = k_res;
          points[ii].data = [];
          $.each(v_res, function(key, val){
            if(val != null) {
              if(ip_version == '4' || ip_version == '6'){
                points[ii].data.push(Math.round(sum_nulls(val['num-sources-ipv' + ip_version]) / denominator));
              }else{
                points[ii].data.push(Math.round(sum_nulls(val['num-sources-ipv4'], val['num-sources-ipv6']) / denominator));
              }
            }else{
              points[ii].data.push(null);
            }
          });
          ii += 1;
        });
      }else{ // chart_type == 'line'
        var totals = {}
        $.each(res, function(rsi, dates){
          $.each(dates, function(date, val){
            if(!(date in totals)){
              totals[date] = 0;
            }
            if(val != null){
              if(ip_version == '4' || ip_version == '6'){
                totals[date] += Math.round(sum_nulls(val['num-sources-ipv' + ip_version]) / denominator);
              }else{
                totals[date] += Math.round(sum_nulls(val['num-sources-ipv4'], val['num-sources-ipv6']) / denominator);
              }
            }
          });
        });

        var points = [];
        points[0] = {};
        points[0].name = 'RSS';
        points[0].data = Object.values(totals);
      }

      options.series = points;
      new Highcharts.Chart(options);
    }});
}
