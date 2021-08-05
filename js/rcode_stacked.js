/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

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
      },
      max: 100,
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
    url: "/api/v1/rcode-volume",
    type: "GET",
    dataType: "json",
    data: {
      rsi: 'a-m',
      start_date: '2017-01-01',
      end_date: document.getElementById('end_date').textContent,
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

      // Prep date_percents
      var date_percents = [];
      for(ii = 0; ii < 24; ii++){ // Iterate across all RCODEs
        date_percents[ii] = [];
      }

      // generate totals
      var date_totals = {};
      $.each(res, function(rsi, dates) {
        date_totals[rsi] = {}
        $.each(dates, function(date, rcodes) {
          date_totals[rsi][date] = 0;
          $.each(rcodes, function(rcode, val) {
            date_totals[rsi][date] += val;
          });
        });
      });

      for(ii = 0; ii < date_percents.length; ii++){
        var jj = 0;
        $.each(res, function(rsi, dates) {
          date_percents[ii][jj] = {};
          date_percents[ii][jj].name = rsi;
          date_percents[ii][jj].data = [];
          $.each(dates, function(date, rcodes) {
            if(rcodes == null){
              date_percents[ii][jj].data.push(null);
            }else{
              if(ii in rcodes){
                if(date_totals[rsi][date] > 0){
                  date_percents[ii][jj].data.push(rcodes[ii] / date_totals[rsi][date] * 100);
                }else{
                  date_percents[ii][jj].data.push(0);
                }
              }
            }
          });
          jj += 1;
        });
      }

      // Draw charts
      for(ii = 0; ii < 10; ii++){
        options.chart.renderTo = 'container_' + ii.toString();
        options.title.text = dns_rcodes[ii] + ' / Total RCODEs';
        options.series = date_percents[ii];
        new Highcharts.Chart(options);
      }
    }});
});
