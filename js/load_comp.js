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
    document.getElementById('start-date-1').value,
    document.getElementById('end-date-1').value,
    'container_1'
  );
}

function rssac002_update_chart_2(){
  rssac002_update_chart(
    document.getElementById('start-date-2').value,
    document.getElementById('end-date-2').value,
    'container_2'
  );
}

function rssac002_update_chart (start_date, end_date, container){
  var options = {
    chart: {
      renderTo: container,
      type: 'boxplot',
    },
    title: {
        text: ''
    },
    legend: {
        enabled: false
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    xAxis: {
      categories: [],
      title: {
        text: 'Root Server Identifier'
      }
    },
    yAxis: {
      title: {
        text: 'load-time'
      }
    },
    series: [],
  };

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/load-time",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: start_date,
      end_date: end_date
    },
    success: function(res){
      var max_len = 0; // Greatest length of our list of load-times
      var categories = [];
      var load_times = {};
      load_times.name = 'load-time';
      load_times.data = [];

      $.each(res, function(rsi, dates) {
        var tmp_times = [];
        $.each(dates, function(date, times) {
          if(times == null){
            tmp_times.push(null);
          }else{
            $.each(times, function(serial, time){
              if(time > 0){
                tmp_times.push(time);
              }else{
                tmp_times.push(null);
              }
            });
          }
        });
        // Ignore RSIs with all null values
        if( !tmp_times.every(function (e) { return e == null} )){
          categories.push(rsi);
          load_times.data.push(tmp_times);
          if(tmp_times.length > max_len){
            max_len = tmp_times.length;
          }
        }
      });

      // All arrays must be of equal length
      for(ii = 0; ii < load_times.data.length; ii++){
        while(max_len > load_times.data[ii].length){
          load_times.data[ii].push(null);
        }
        load_times.data[ii].sort((a, b) => a - b);
      }

      options.xAxis.categories = categories;
      options.series.push(load_times);
      options.title.text = start_date + ' / ' + end_date + ' load-time';
      new Highcharts.Chart(options);
    }});
}
