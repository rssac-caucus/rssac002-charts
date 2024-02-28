/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

$(document).ready(function() {
  rssac002_update_chart();
});

function rssac002_update_chart(){
  var options = {
    chart: {
      renderTo: '',
      type: 'area',
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
          return this.value + '%';
        }
      }
    },
    plotOptions: {
      area: {
        stacking: 'percent',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      },
      series: {
        pointStart: Date.UTC('2017', '00', '02'),  // Jan is zero'th month in JS
      }
    },
    series: [{}]
  };

  // Read some values from the HTML
  var end_date = document.getElementById('end_date').textContent;
  var time_interval = document.querySelector('input[name = "time_interval"]:checked').value;

  // Determine request JSON based on time_interval
  if(time_interval == 'day'){
    var suffix_text = 'day';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
    };
    options.plotOptions.series.pointInterval =  86400000; // 1 day in ms
  }else{
    var suffix_text = 'week';
    var req_data = {
      rsi: 'a-m',
      start_date: '2017-01-02',
      end_date: end_date,
      week: true,
    };
    var tooltip = {
      dateTimeLabelFormats: {
        week:  ["Week %W, from %A, %b %e, %Y"],
      }
    };
    options.tooltip = tooltip;
    options.plotOptions.series.pointInterval = 604800000; // 1 week in ms
  }

  $.ajax({
    url: "/api/v1/rcode-volume",
    type: "GET",
    dataType: "json",
    data: req_data,

    success: function(res){
      var dns_rcodes = { // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
        '0': 'NoError', '1': 'FormErr', '2': 'ServFail', '3': 'NXDomain',
        '4': 'NotImp', '5': 'Refused', '6': 'YXDomain', '7': 'YXRRSet',
        '8': 'NXRRSet', '9': 'NotAuth', '10': 'NotZone', '11': 'DSOTYPENI',
        '12': '12_Unassigned', '13': '13_Unassigned', '14': '14_Unassigned',
        '15': '15_Unassigned', '16': 'BADSIG', '17': 'BADKEY', '18': 'BADTIME',
        '19': 'BADMODE', '20': 'BADNAME', '21': 'BADALG', '22': 'BADTRUNC',
        '23': 'BADCOOKIE'};

      // generate series
      var rcode_series = {};
      var chart_series = {};
      $.each(res, function(rsi, dates) {
        chart_series[rsi] = [];
        rcode_series[rsi] = {};
        $.each(dns_rcodes, function(key, value) {
          rcode_series[rsi][key] = {};
          rcode_series[rsi][key].name = value;
          rcode_series[rsi][key].data = [];
        });

        $.each(dates, function(date, rcodes) {
          if(rcodes == null) {
            $.each(dns_rcodes, function(key, value) {
              rcode_series[rsi][key].data.push(null);
            });
          }else{
            $.each(rcodes, function(rcode, val) {
              if(rcode in rcode_series[rsi]){
                rcode_series[rsi][rcode].data.push(val);
              }else{
                rcode_series[rsi][rcode] = {};
                rcode_series[rsi][rcode].name = dns_rcodes[rcode];
                rcode_series[rsi][rcode].data = [];
                rcode_series[rsi][rcode].data.push(val);
              }
            });
          }
        });
        $.each(rcode_series[rsi], function(rcode, series_data) {
          if(! series_data.data.every(element => element === null)){ // Don't copy series with all null values
            chart_series[rsi].push(series_data);
          }
        });
      });

      // Draw charts
      $.each(chart_series, function(rsi, rcodes) {
        options.chart.renderTo = 'container_' + rsi;
        options.title.text = rsi + '.root-servers.net RCODEs by-' + suffix_text;
        options.series = rcodes;
        new Highcharts.Chart(options);
      });
    }});
}
