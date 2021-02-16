$(function() {
  $.datepicker.setDefaults({
    minDate: new Date(2017, 1 - 1, 1),
    maxDate: "-2w",
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
  })
  $( "#start-date-1" ).datepicker();
  $( "#end-date-1" ).datepicker();
  $( "#start-date-2" ).datepicker();
  $( "#end-date-2" ).datepicker();
});

$(document).ready(function() {
  rssac002_update_chart_1();
  rssac002_update_chart_2();
});

function rssac002_update_chart_1(){
  rssac002_update_chart(
    document.getElementById('rsi-1').value,
    document.getElementById('start-date-1').value,
    document.getElementById('end-date-1').value,
    'container_1'
  );
}

function rssac002_update_chart_2(){
  rssac002_update_chart(
    document.getElementById('rsi-2').value,
    document.getElementById('start-date-2').value,
    document.getElementById('end-date-2').value,
    'container_2'
  );
}

// Takes an arroy of string ranges, '32-47', '48-63', '64-79'
// Returns lowest range
function lowest_range(ranges){
  var lowest = 0;
  for(ii = 0; ii < ranges.length; ii++){
    if(Number(ranges[ii].split("-")[0]) < Number(ranges[lowest].split("-")[0])){
      lowest = ii;
    }
  }
  return ranges[lowest];
}

function rssac002_update_chart (rsi_list, start_date, end_date, container){
  var options = {
    chart: {
      renderTo: container,
      type: 'column',
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    xAxis: {
      categories: [],
    },
    yAxis: {
      title: {
        text: ''
      },
      labels: {
        formatter: function () {
          return this.value * 100 + "%";
        }
      },
    },
    tooltip: {
      formatter: function () {
        return  this.x + "<br/> " + this.series.name  + " " + (this.y * 100).toFixed(4) + "%";
      }
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        events: {
          legendItemClick: function() {
            return false;
          }
        }
      }
    },
    series: [{}],
  };

  var metric = document.getElementById('metric').textContent;
  $.ajax({
    url: "http://rssac002.depht.com/api/v1/" + metric,
    type: "GET",
    dataType: "json",
    data: {
      rsi: rsi_list,
      start_date: start_date,
      end_date: end_date
    },
    success: function(res){
      var total_pkts = 0;
      var RSIs = {};
      var sizes = {};
      $.each(res, function(rsi, dates) {
        RSIs[rsi] = {};
        RSIs[rsi].data = [];
        RSIs[rsi].name = rsi;
        $.each(dates, function(date, data) {
          if(data != null){
            $.each(data, function(key, val) {
              if(! (key in sizes)){
                sizes[key] = {};
              }
              if(! (rsi in sizes[key])){
                sizes[key][rsi] = 0;
              }
              sizes[key][rsi] += val;
              total_pkts += val;
            });
          }
        });
      });

      // Remove sizes under significance_threshold
      var significance_threshold = 0.01; // 1%
      var insignificant_sizes = [];
      $.each(sizes, function(size, letters){
        var size_total = 0;
        $.each(letters, function(letter, value){
          size_total += value;
        });
        if(size_total / total_pkts < significance_threshold){
          insignificant_sizes.push(size);
        }
      });
      for(ii = 0; ii < insignificant_sizes.length; ii++){
        delete sizes[insignificant_sizes[ii]];
      }

      // Ordered reduce forming output series
      var categories = [];
      var max_range = "";
      while(Object.keys(sizes).length){
        var key = lowest_range(Object.keys(sizes));

        if(max_range === ""){
          categories.push(key);
          $.each(RSIs, function(rsi, _){
            if(! (rsi in sizes[key])){
              RSIs[rsi].data.push(0);
            }else{
              RSIs[rsi].data.push(sizes[key][rsi] / total_pkts);
            }
          });

          if(key.split("-")[1].length === 0){ // max range
            max_range = key;
          }
        }else{
          $.each(RSIs, function(rsi, _){
            RSIs[rsi].data[RSIs[rsi].data.length - 1] += sizes[key][rsi] / total_pkts;
          });
        }
        delete sizes[key];
      }

      options.xAxis.categories = categories;
      options.series = Object.values(RSIs);
      options.title.text = start_date + ' / ' + end_date + ' ' + metric;
      new Highcharts.Chart(options);
    }});
}
