<?php
	$dbconn = pg_connect("host='192.168.99.100' port='5432' dbname='gis' user='postgres' password=''");
	
	$query = "select stvrte.name, count(parkoviska.amenity) as pocet, ST_AsGeoJSON(stvrte.way) as geojson from planet_osm_polygon as parkoviska
				cross join planet_osm_polygon as stvrte
				where stvrte.boundary='administrative' and stvrte.name is not null and parkoviska.amenity='parking' and ST_Contains(stvrte.way, parkoviska.way)
				group by stvrte.name, geojson
				order by pocet;";
	
	pg_set_client_encoding($dbconn, "UNICODE");
	
	$result = pg_query($dbconn, $query);
	$rows = pg_fetch_all($result);
	
	if ($rows) {
		$response = array();
		$i=0;
		foreach ($rows as $row) {
			$response[$i]['count']= $row['pocet'];
			$response[$i]['geometry']=json_decode($row['geojson'], true);
			$response[$i]['properties'] = array();
            $response[$i]['properties']['name'] = $row['name'];
			$i++;
				
		}

		header('Content-type: application/json');
		echo json_encode($response,JSON_NUMERIC_CHECK);
		
	} else {
		print "Failed!";
		die(json_encode($response));
	}
?>