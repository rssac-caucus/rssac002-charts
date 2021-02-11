$( function() {
  $.datepicker.setDefaults({
    minDate: new Date(2017, 1 - 1, 1),
    maxDate: "-2w",
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
  })

  $( "#start-date-1" ).datepicker();
  $( "#end-date-1" ).datepicker();
});


$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart (){
  var options = {
    chart: {
      renderTo: 'container',
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
    url: "http://rssac002.depht.com/api/v1/rcode-volume",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: document.getElementById('start-date-1').value,
      end_date: document.getElementById('end-date-1').value,
    },
    success: function(res){
      // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
      var dns_rcodes = {
        '0': 'NoError', '1': 'FormErr', '2': 'ServFail', '3': 'NXDomain',
        '4': 'NotImp', '5': 'Refused', '6': 'YXDomain', '7': 'YXRRSet',
        '8': 'NXRRSet', '9': 'NotAuth', '10': 'NotZone', '11': 'DSOTYPENI',
        '12': '12_Unassigned', '13': '13_Unassigned', '14': '14_Unassigned',
        '15': '15_Unassigned', '16': 'BADSIG', '17': 'BADKEY', '18': 'BADTIME',
        '19': 'BADMODE', '20': 'BADNAME', '21': 'BADALG', '22': 'BADTRUNC',
        '23': 'BADCOOKIE'};

      var start_date = document.getElementById('start-date-1').value;
      var end_date = document.getElementById('end-date-1').value;
      var rcode_totals = {}; // total rcodes per-rsi
      var totals = {}; // totals for each rcode
      // generate totals
      $.each(res, function(rsi, dates) {
        $.each(dates, function(date, rcodes) {
          $.each(rcodes, function(rcode, val) {
            if(! (rcode in rcode_totals)){
              rcode_totals[rcode] = {};
            }

            if(rsi in rcode_totals[rcode]) {
              rcode_totals[rcode][rsi] += val;
            }else{
              rcode_totals[rcode][rsi] = val;
            }

            if(rcode in totals) {
              totals[rcode] += val;
            }else{
              totals[rcode] = val;
            }

            if( !(rcode in dns_rcodes)){
              dns_rcodes[rcode] = "Other";
            }
          });
        });
      });

      var top_values = [];
      $.each(totals, function(key, val){
        var entry = {};
        entry.name = dns_rcodes[key];
        entry.y = val;
        entry.drilldown = dns_rcodes[key];
        top_values.push(entry);
      });
      var series_entry = {};

      series_entry.name = "rcodes";
      series_entry.colorByPoint = true;
      series_entry.data = top_values;
      options.series.push(series_entry);

      // create drilldown series
      var drilldown_series = [];
      $.each(rcode_totals, function(rcode, rsi){
        var entry = {};
        entry.name = dns_rcodes[rcode];
        entry.id = dns_rcodes[rcode];
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
      options.title.text = start_date + ' - ' + end_date;

      new Highcharts.Chart(options);
    }});
}
