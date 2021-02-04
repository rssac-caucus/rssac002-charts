#!/usr/local/bin/php
<?php
/* Copyright Andrew McConachie <andrew@depht.com> 2021 */

// Only allow execution via the CLI
if( !php_sapi_name() == 'cli'){
  exit();
}

$template_dir = 'html_templates/';
$header = file_get_contents($template_dir . 'header');
$footer = file_get_contents($template_dir . 'footer');
$menu = file_get_contents($template_dir . 'menu');

$pages = array();
array_push($pages, array('template' => 'single_queries',
                         'header_v' => array('@TITLE@' => 'Total Queries Received', '@SCRIPT@' => 'single_queries.js')));
array_push($pages, array('template' => 'total_queries',
                         'header_v' => array('@TITLE@' => 'Total Queries Received', '@SCRIPT@' => 'total_queries.js')));
array_push($pages, array('template' => 'single_responses',
                         'header_v' => array('@TITLE@' => 'Total Queries Received', '@SCRIPT@' => 'single_responses.js')));
array_push($pages, array('template' => 'total_responses',
                         'header_v' => array('@TITLE@' => 'Total Responses Sent', '@SCRIPT@' => 'total_responses.js')));

array_push($pages, array('template' => 'breakdown_queries_prot',
                         'header_v' => array('@TITLE@' => 'Queries Received by Protocol', '@SCRIPT@' => 'breakdown_queries_prot.js')));
array_push($pages, array('template' => 'breakdown_responses_prot',
                         'header_v' => array('@TITLE@' => 'Responses Sent by Protocol', '@SCRIPT@' => 'breakdown_responses_prot.js')));
array_push($pages, array('template' => 'breakdown_queries_rsi',
                         'header_v' => array('@TITLE@' => 'Queries Received by RSI', '@SCRIPT@' => 'breakdown_queries_rsi.js')));
array_push($pages, array('template' => 'breakdown_responses_rsi',
                         'header_v' => array('@TITLE@' => 'Responses Sent by RSI', '@SCRIPT@' => 'breakdown_responses_rsi.js')));

array_push($pages, array('template' => 'unique_sources_ipv4',
                         'header_v' => array('@TITLE@' => 'IPv4 Unique Sources', '@SCRIPT@' => 'unique_sources.js')));
array_push($pages, array('template' => 'unique_sources_ipv6',
                         'header_v' => array('@TITLE@' => 'IPv6 Unique Sources', '@SCRIPT@' => 'unique_sources.js')));

array_push($pages, array('template' => 'rcode_pie',
                         'header_v' => array('@TITLE@' => 'Return Codes December 2020', '@SCRIPT@' => 'rcode_pie.js')));
array_push($pages, array('template' => 'rcode_stacked',
                         'header_v' => array('@TITLE@' => 'Each RCODE as percent of total RCODEs per RSI', '@SCRIPT@' => 'rcode_stacked.js')));
array_push($pages, array('template' => 'rcode_stacked_rsi',
                         'header_v' => array('@TITLE@' => 'RCODEs per RSI', '@SCRIPT@' => 'rcode_stacked_rsi.js')));

foreach($pages as $page){
  $our_header = $header;
  foreach($page['header_v'] as $key => $val){
    $our_header = str_replace($key, $val, $our_header);
  }
  $meat = file_get_contents($template_dir . $page['template']);

  file_put_contents($page['template'] . '.html', $our_header . $menu . $meat . $footer);
  chmod($page['template'] . '.html', 0644);
}
?>