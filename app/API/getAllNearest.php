<?php
	$lng = $_POST['lng'];
	$lat = $_POST['lat'];
	$dist = $_POST['dist'];
	$dbconn = pg_connect("host='192.168.99.100' port='5432' dbname='gis' user='postgres' password=''");
	$query = "select amenity, name, ST_AsGeoJSON(ST_Centroid(way::geometry)::geography)
			FROM (SELECT amenity, name,way FROM planet_osm_polygon WHERE amenity='parking'
			union
			SELECT amenity, name, way FROM planet_osm_point WHERE amenity='parking') as subquery
			LEFT JOIN LATERAL ST_Distance(st_makepoint($lng, $lat), subquery.way::geography) as distance on true 
			where distance<$dist
			order by distance ;";
	
	pg_set_client_encoding($dbconn, "UNICODE");
	
	$result = pg_query($dbconn, $query);
	$rows = pg_fetch_all($result);
	
	if ($rows) {
		$response = array();
		$i=0;
		foreach ($rows as $row) {
			$response[$i]['geometry']=json_decode($row['st_asgeojson'], true);
			$response[$i]['properties'] = array();
			if ($row['name']==null)
				$row['name']="No Name";
            $response[$i]['properties']['name'] = $row['name'];
			$i++;				
		}
		
		header('Content-type: application/json');
		echo json_encode($response,JSON_FORCE_OBJECT);
		
	} else {
		$response = array();
		die(json_encode($response, JSON_FORCE_OBJECT));
	}
?>
