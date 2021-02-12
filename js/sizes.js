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

function rssac002_update_chart_1 (){
  rssac002_update_chart(
    document.getElementById('start-date-1').value,
    document.getElementById('end-date-1').value,
    'container_1'
  );
}

function rssac002_update_chart_2 (){
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
      type: 'pie',
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'Source: RSSAC002 Data'
    },
    accessibility: {
      announceNewData: {
        enabled: true
      },
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        center: ["50%", "50%"],
        size: "100%",
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function() {
            return this.point.name + " " + Math.round(this.percentage*100)/100 + '%';
          },
        }
      }
    },
    series: [{}],
    drilldown: {
      series: [],
    },
  };

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/traffic-sizes",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: start_date,
      end_date: end_date
    },
    success: function(res){
      switch(document.getElementById('prot').textContent) {
      case 'udp':
        switch(document.getElementById('direction').textContent) {
        case 'received':
          var metric = 'udp-request-sizes';
          break;
        case 'sent':
          var metric = 'udp-response-sizes';
          break;
        }
        break;
      case 'tcp':
        switch(document.getElementById('direction').textContent) {
        case 'received':
          var metric = 'tcp-request-sizes';
          break;
        case 'sent':
          var metric = 'tcp-response-sizes';
          break;
        }
      }

      var size_totals = {}; // total packets per-rsi by size
      var totals = {}; // totals for each size
      $.each(res, function(rsi, dates) {
        $.each(dates, function(date, metrics) {
          if(metrics != null){
            $.each(metrics[metric], function(size, val) {
              if(! (size in size_totals)){
                size_totals[size] = {};
              }

              if(rsi in size_totals[size]) {
                size_totals[size][rsi] += val;
              }else{
                size_totals[size][rsi] = val;
              }

              if(size in totals) {
                totals[size] += val;
              }else{
                totals[size] = val;
              }
            });
          }
        });
      });

      var top_values = [];
      $.each(totals, function(key, val){
        var entry = {};
        entry.name = key;
        entry.y = val;
        entry.drilldown = key;
        top_values.push(entry);
      });
      var series_entry = {};

      series_entry.name = "sizes";
      series_entry.colorByPoint = true;
      series_entry.data = top_values;
      options.series.push(series_entry);

      // create drilldown series
      var drilldown_series = [];
      $.each(size_totals, function(size, rsi){
        var entry = {};
        entry.name = size;
        entry.id = size;
        entry.data = [];
        $.each(rsi, function(letter, count){
          var rsi_entry = [];
          rsi_entry.push(letter.toUpperCase());
          rsi_entry.push(count);
          entry.data.push(rsi_entry);
        });
        drilldown_series.push(entry);
      });

      options.drilldown.series = drilldown_series;
      options.title.text = metric + ' ' + start_date + ' - ' + end_date;
      new Highcharts.Chart(options);
    }});
}
