/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

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
        text: ''
      },
      labels: {
        formatter: function () {
          return this.value / 1000000000;
        }
      }
    },
    plotOptions: {},
    series: [{}]
  };

  // Read some values from the HTML
  var direction = document.getElementById('direction').textContent;
  var end_date = document.getElementById('end_date').textContent;
  var chart_type = document.querySelector('input[name = "chart_type"]:checked').value;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = 'per-day (billion)';
    var denominator = 1;
    var point_interval =  86400000; // 1 day in ms
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      totals: direction,
    };
  }else{
    var suffix_text = 'by-week (billion) (daily average)';
    var denominator = 7;
    var point_interval = 604800000; // 1 week in ms
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
      totals: direction,
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

  if(direction == 'received'){
    options.title.text = 'Queries Received ' + suffix_text;
    options.yAxis.title.text = 'queries';
  }else{
    options.title.text = 'Responses Sent ' + suffix_text;
    options.yAxis.title.text = 'responses';
  }

  $.ajax({
    url: "/api/v1/traffic-volume",
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
              points[ii].data.push(Math.round(sum_vals(val) / denominator));
            }else{
              points[ii].data.push(null);
            }
          });
          ii += 1;
        });
      }else{ // chart_type == 'line'
        var totals = {}
        $.each(res, function(rsi, dates) {
          $.each(dates, function(date, val) {
            if(!(date in totals)){
              totals[date] = 0;
            }
            if(val != null){
              totals[date] += Math.round(sum_vals(val) / denominator);
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
