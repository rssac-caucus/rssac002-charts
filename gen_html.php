#!/usr/bin/env php
<?php
/* Copyright Andrew McConachie <andrew@depht.com> 2021 2024 */

// Only allow execution via the CLI
if( !php_sapi_name() == 'cli'){
  exit();
}

$template_dir = 'html_templates/'; // Where to read the templates
$out_dir = 'site/'; // Where to write everything

// Test dirs
if( !is_dir($template_dir)){
  print("Bad template directory " . $template_dir);
  exit(1);
}
if( !is_dir($out_dir)){
  print("Bad output directory " . $out_dir);
  exit(1);
}else{
  if( !is_writable($out_dir)){
    print("Output directory not writable " . $out_dir);
    exit(1);
  }
}

// Static files not created with templates
if( !is_link($out_dir . 'index.html')){
  if( !symlink('volume_single_queries.html', $out_dir . 'index.html')){
    print("Failed to create symlink to index.html");
    exit(1);
  }
}
if( !copy($template_dir . 'charts.css', $out_dir . 'charts.css')){
  print("Failed to copy charts.css");
  exit(1);
}else{
  chmod($out_dir . 'charts.css', 0644);
}

if( !is_dir($out_dir . 'js/')){
  if( !mkdir($out_dir . 'js/', 0755)){
    print("Failed to make " . $out_dir . "/js directory");
    exit(1);
  }
}
if( !is_dir('js/')){
  print("Cannot read directory /js");
  exit(1);
}else{
  chmod($out_dir . 'js', 0755);
  foreach(glob('js/*.js') as $fp){
    if( !copy($fp, $out_dir . $fp)){
      print("Failed to copy " . $fp);
      exit(1);
    }
    chmod($out_dir . $fp, 0644);
  }
}

if( !is_dir($out_dir . 'js/hs')){
  if( !mkdir($out_dir . 'js/hs', 0755)){
    print("Failed to make " . $out_dir . "/js/hs directory");
    exit(1);
  }
}
if( !is_dir('js/hs')){
  print("Cannot read directory /js/hs");
  exit(1);
}else{
  chmod($out_dir . 'js/hs', 0755);
  foreach(glob('js/hs/*.js') as $fp){
    if( !copy($fp, $out_dir . $fp)){
      print("Failed to copy " . $fp);
      exit(1);
    }
    chmod($out_dir . $fp, 0644);
  }
}

// Read in some common templates
$header = file_get_contents($template_dir . 'header'); // Default header
$footer = file_get_contents($template_dir . 'footer');
$menu = file_get_contents($template_dir . 'menu');

// Create our date strings
$now = getdate();
$last_year = $now['year'] - 1;
$start_date = $last_year . '-' . $now['mon'] . '-01'; // First day of this month last year
$ts = time() - 60 * 60 * 24 * 21; // 21 days ago
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
                         'header_v' => array('@TITLE@' => 'Queries Received by RSI', '@SCRIPT@' => 'volume_rsi.js'),
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
                         'header_v' => array('@TITLE@' => 'Responses Sent by RSI', '@SCRIPT@' => 'volume_rsi.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_udp_v_tcp_responses',
                         'header_v' => array('@TITLE@' => 'UDP vs TCP Responses', '@SCRIPT@' => 'volume_udp_v_tcp.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'volume_ipv4_v_ipv6_responses',
                         'header_v' => array('@TITLE@' => 'IPv4 vs IPv6 Responses', '@SCRIPT@' => 'volume_ipv4_v_ipv6.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// unique-sources
array_push($pages, array('meat' => 'unique_sources_single',
                         'header_v' => array('@TITLE@' => 'IPv4 and IPv6 Sources', '@SCRIPT@' => 'unique_sources.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_vs',
                         'header_v' => array('@TITLE@' => 'Sources by Percent', '@SCRIPT@' => 'unique_sources_vs.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_queries',
                         'header_v' => array('@TITLE@' => 'Queries Received / Unique Sources', '@SCRIPT@' => 'unique_sources_queries.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'unique_sources_instances',
                         'header_v' => array('@TITLE@' => 'Unique Sources / Instances', '@SCRIPT@' => 'unique_sources_instances.js'),
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

// load-time
array_push($pages, array('meat' => 'load_single', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'load-time', '@SCRIPT@' => 'load_single.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'load_rsi', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'load-time by RSI', '@SCRIPT@' => 'load_rsi.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'load_threshold', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'load-times by threshold', '@SCRIPT@' => 'load_threshold.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));

// traffic-sizes
array_push($pages, array('meat' => 'sizes_single',
                         'header_v' => array('@TITLE@' => 'RSS traffic-sizes', '@SCRIPT@' => 'sizes_single.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_single_percent',
                         'header_v' => array('@TITLE@' => 'Top Sizes by Percent', '@SCRIPT@' => 'sizes_single_percent.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_bar', 'header' => 'header_jqueryui',
                         'header_v' => array('@TITLE@' => 'Packet Sizes', '@SCRIPT@' => 'sizes_bar.js'),
                         'meat_v' => array('@START_DATE@' => $start_date, '@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'sizes_rsi',
                         'header_v' => array('@TITLE@' => 'traffic-sizes by RSI', '@SCRIPT@' => 'sizes_rsi.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// zone-size
array_push($pages, array('meat' => 'zone_size',
                         'header_v' => array('@TITLE@' => 'Root Zone Size', '@SCRIPT@' => 'zone_size.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

// Instances
array_push($pages, array('meat' => 'instance_count',
                         'header_v' => array('@TITLE@' => 'Instance Count', '@SCRIPT@' => 'instance_count.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));
array_push($pages, array('meat' => 'site_detail_map','header' => 'header_map',
                         'header_v' => array('@TITLE@' => 'Global Map', '@SCRIPT@' => 'site_detail_map.js'),
                         'meat_v' => array('@END_DATE@' => $end_date)));

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

  file_put_contents($out_dir . $page['meat'] . '.html', $our_header . $menu . $meat . $footer);
  chmod($out_dir . $page['meat'] . '.html', 0644);
}
?>
