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

// Calculate mean(average) of an arbitrary set of numbers
function mean(){
  return sum_vals(arguments) / arguments.length;
}

// Calculate the median value of an array of numbers
// Credit to https://stackoverflow.com/questions/25305640/find-median-values-from-array-in-javascript-8-values-or-9-values
function median(arr){
  arr.sort(function(a, b){ return a - b; });
  var i = arr.length / 2;
  return i % 1 == 0 ? (arr[i - 1] + arr[i]) / 2 : arr[Math.floor(i)];
}

// Calculate quantile for an array of numbers
// Takes an array and a float between 0 and 1
// Credit to https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
function quantile(arr, q){
  var sorted = arr.sort((a, b) => a - b);
  var pos = (sorted.length - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;
  if (sorted[base + 1] !== undefined){
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }else{
    return sorted[base];
  }
}

// Monkeypatch %W into HighCharts.dateFormats
// Credit to https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/global/dateformats/
Highcharts.dateFormats.W = function (timestamp) {
    var date = new Date(timestamp),
        day = date.getUTCDay() === 0 ? 7 : date.getUTCDay(),
        dayNumber;

    date.setDate(date.getUTCDate() + 4 - day);
    dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000);

    return 1 + Math.floor(dayNumber / 7);
};
