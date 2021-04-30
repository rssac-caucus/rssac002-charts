#!/usr/local/bin/php
<?php
/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

// Only allow execution via the CLI
if( !php_sapi_name() == 'cli'){
  exit();
}

$template_dir = 'html_templates/';
$header = file_get_contents($template_dir . 'header'); // Default header
$footer = file_get_contents($template_dir . 'footer');
$menu = file_get_contents($template_dir . 'menu');

// Create our date strings
$now = getdate();
$start_date = $now['year'] . '-01-01'; // Jan 1 of the current year

$ts = time() - 60 * 60 * 24 * 14; // 14 days ago
$dt = new DateTime("@$ts");
$end_date = $dt->format('Y-m-d');

$pages = array();

// traffic-volume queries
array_push($pages, array('meat' => 'volume_single_queries',
                         'header_v' => array('@TITLE@' => 'Total Queries Received', '@SCRIPT@' => 'volume_single.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_prot_queries',
                         'header_v' => array('@TITLE@' => 'Queries Received by Protocol', '@SCRIPT@' => 'volume_prot.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_rsi_queries',
                         'header_v' => array('@TITLE@' => 'Queries Received by RSI', '@SCRIPT@' => 'breakdown_queries_rsi.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_udp_v_tcp_queries',
                         'header_v' => array('@TITLE@' => 'UDP vs TCP Queries', '@SCRIPT@' => 'volume_udp_v_tcp.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_ipv4_v_ipv6_queries',
                         'header_v' => array('@TITLE@' => 'IPv4 vs IPv6 Queries', '@SCRIPT@' => 'volume_ipv4_v_ipv6.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// traffic-volume responses
array_push($pages, array('meat' => 'volume_single_responses',
                         'header_v' => array('@TITLE@' => 'Total Queries Received', '@SCRIPT@' => 'volume_single.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_prot_responses',
                         'header_v' => array('@TITLE@' => 'Responses Sent by Protocol', '@SCRIPT@' => 'volume_prot.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_rsi_responses',
                         'header_v' => array('@TITLE@' => 'Responses Sent by RSI', '@SCRIPT@' => 'breakdown_responses_rsi.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_udp_v_tcp_responses',
                         'header_v' => array('@TITLE@' => 'UDP vs TCP Responses', '@SCRIPT@' => 'volume_udp_v_tcp.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_ipv4_v_ipv6_responses',
                         'header_v' => array('@TITLE@' => 'IPv4 vs IPv6 Responses', '@SCRIPT@' => 'volume_ipv4_v_ipv6.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// unique-sources
array_push($pages, array('meat' => 'unique_sources_ipv4',
                         'header_v' => array('@TITLE@' => 'IPv4 Unique Sources', '@SCRIPT@' => 'unique_sources.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_ipv6',
                         'header_v' => array('@TITLE@' => 'IPv6 Unique Sources', '@SCRIPT@' => 'unique_sources.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_vs',
                         'header_v' => array('@TITLE@' => 'Sources by Percent', '@SCRIPT@' => 'unique_sources_vs.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_both',
                         'header_v' => array('@TITLE@' => 'IPv4 and IPv6 Sources', '@SCRIPT@' => 'unique_sources.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));


// rcode-volume
array_push($pages, array('meat' => 'rcode_pie', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'rcode-volume Overall', '@SCRIPT@' => 'rcode_pie.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
/*array_push($pages, array('meat' => 'rcode_stacked',
                         'header_v' => array('@TITLE@' => 'Each RCODE as percent of total RCODEs per RSI', '@SCRIPT@' => 'rcode_stacked.js'),
                         'meat_v' => array('@END_DATE@' => $end_date))); */
array_push($pages, array('meat' => 'rcode_stacked_rsi',
                         'header_v' => array('@TITLE@' => 'rcode-volume by RSI', '@SCRIPT@' => 'rcode_stacked_rsi.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'rcode_0_v_3',
                         'header_v' => array('@TITLE@' => 'NOERROR vs NXDOMAIN', '@SCRIPT@' => 'rcode_0_v_3.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// traffic-sizes
array_push($pages, array('meat' => 'sizes_udp_queries_line',
                         'header_v' => array('@TITLE@' => 'traffic-sizes UDP Queries by RSI', '@SCRIPT@' => 'sizes_line.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_udp_responses_line',
                         'header_v' => array('@TITLE@' => 'traffic-sizes UDP Responses by RSI', '@SCRIPT@' => 'sizes_line.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_tcp_queries_line',
                         'header_v' => array('@TITLE@' => 'traffic-sizes TCP Queries by RSI', '@SCRIPT@' => 'sizes_line.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_tcp_responses_line',
                         'header_v' => array('@TITLE@' => 'traffic-sizes TCP Responses by RSI', '@SCRIPT@' => 'sizes_line.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

array_push($pages, array('meat' => 'sizes_udp_queries_comp', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'traffic-sizes UDP Queries', '@SCRIPT@' => 'sizes_bar.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_udp_responses_comp', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'traffic-sizes UDP Responses', '@SCRIPT@' => 'sizes_bar.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_tcp_queries_comp', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'traffic-sizes TCP Queries', '@SCRIPT@' => 'sizes_bar.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_tcp_responses_comp', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'traffic-sizes TCP Responses', '@SCRIPT@' => 'sizes_bar.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));

// load-time
array_push($pages, array('meat' => 'load_comp', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'load-time comparison', '@SCRIPT@' => 'load_comp.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));

foreach($pages as $page){
  if(array_key_exists('header', $page)){
    $our_header = file_get_contents($template_dir . $page['header']);
  }else{
    $our_header = $header;
  }

  foreach($page['header_v'] as $key => $val){
    $our_header = str_replace($key, $val, $our_header);
  }

  $meat = file_get_contents($template_dir . $page['meat']);
  if($meat === false){
    print("Error reading file " . $template_dir . $page['meat']);
    continue;
  }
  foreach($page['meat_v'] as $key => $val){
    $meat = str_replace($key, $val, $meat);
  }

  file_put_contents($page['meat'] . '.html', $our_header . $menu . $meat . $footer);
  chmod($page['meat'] . '.html', 0644);
}
?>