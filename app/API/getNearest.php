<?php
	$lng = $_POST['lng'];
	$lat = $_POST['lat'];
	$dbconn = pg_connect("host='192.168.99.100' port='5432' dbname='gis' user='postgres' password=''");
	$query = "select amenity, name, ST_AsGeoJSON(ST_Centroid(way::geometry)::geography), ST_Distance(st_makepoint($lng, $lat), subquery.way::geography) as distance
				FROM (SELECT amenity, name,way FROM planet_osm_polygon WHERE amenity='parking' 
				union
				SELECT amenity, name, way FROM planet_osm_point WHERE amenity='parking'  ) as subquery
				order by distance asc limit 1;";
	
	pg_set_client_encoding($dbconn, "UNICODE");
	
	$result = pg_query($dbconn, $query);
	$rows = pg_fetch_all($result);
	
	if ($rows) {
		$response = array();
		$i=0;
		foreach ($rows as $row) {
			$response[$i]['geometry']=json_decode($row['st_asgeojson'], true);
			$response[$i]['properties'] = array();
            $response[$i]['properties']['name'] = $row['name'];
			$i++;				
		}
		
		header('Content-type: application/json');
		echo json_encode($response,JSON_FORCE_OBJECT);
		
	} else {
		print "Failed!";
		die(json_encode($response));
	}
?>