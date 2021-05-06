/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

// This file contains shared functions in use across multiple charts

// Summation function for dirty data
// Treat null as zero and ignore non-numbers
function sum_vals(){
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

// Monkeypatch %W into HighCharts.dateFormats
// https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/global/dateformats/
Highcharts.dateFormats.W = function (timestamp) {
    var date = new Date(timestamp),
        day = date.getUTCDay() === 0 ? 7 : date.getUTCDay(),
        dayNumber;

    date.setDate(date.getUTCDate() + 4 - day);
    dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000);

    return 1 + Math.floor(dayNumber / 7);
};
