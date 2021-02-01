$(document).ready(function() {
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
        pointInterval: 86400000, // 1 day in ms
        stacking: 'percent',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      }
    },
    series: [{}]
  };

  $.ajax({
    url: "http://rssac002.depht.com/api/v1/rcode-volume",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: '2020-12-31',
    },
    success: function(res){
      options.plotOptions.area.pointStart = Date.UTC('2017', '00', '01'); // Jan is zero'th month in JS

      //console.log("Start rcode_pie.js");
      // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
      var dns_rcodes = {
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
        options.title.text = rsi + '.root-servers.net RCODEs';
        options.series = rcodes;
        new Highcharts.Chart(options);
      });
    }});
});
