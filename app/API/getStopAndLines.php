<?php
	$lng = $_POST['lng'];
	$lat = $_POST['lat'];
	$dist = $_POST['dist'];
	$dbconn = pg_connect("host='192.168.99.100' port='5432' dbname='gis' user='postgres' password=''");
	$query1 = "select name, ST_AsGeoJSON(way) from planet_osm_point as z 
			where st_distance(st_makepoint($lng, $lat),z.way::geography)<$dist
			and z.public_transport='stop_position';";
			
	$query2 = "select l.ref as lname, ST_AsGeoJSON(l.way) from planet_osm_line as l, planet_osm_point as z
				where st_distance(st_makepoint($lng, $lat),z.way::geography)<$dist
				and st_intersects(l.way,z.way)
				and l.ref is not null
				and z.public_transport='stop_position';";
	
	pg_set_client_encoding($dbconn, "UNICODE");
	
	$result1 = pg_query($dbconn, $query1);
	$result2 = pg_query($dbconn, $query2);
	
	$rows = pg_fetch_all($result1);
	$response = array();
	if ($rows) {			
		$features = array();
		$feature['type']="Feature";
		$feature['properties']['icon']="bus";
		$i=0;
		foreach ($rows as $row) {			
				$feature['geometry']=json_decode($row['st_asgeojson'], true);				
				$feature['properties']['name'] = $row['name'];
				$features[$i]=$feature;
			$i++;					
		}
		$response[0]=$features;		
	} 
	
		$rows = pg_fetch_all($result2);
	if ($rows) {
		$features2 = array();
		$feature2['type']="Feature";
		$i=0;
		$features2 = array();
		foreach ($rows as $row) {
			$feature2['geometry']=json_decode($row['st_asgeojson'], true);
			$feature2['properties']['name'] = $row['lname'];				
			$features2[$i]=$feature2;
			$i++;				
		}
		$response[1]=$features2;	
	} 
	
		header('Content-type: application/json');
		echo json_encode($response,JSON_NUMERIC_CHECK);
		
?>