
function dlzkaObjektu(obj) {
    var size = 0, key;
    for (key in obj) {
		if(obj[0]=='{')
			return size;
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function addPoint (map,lat,lng){
	remove("point");		
	map.addSource("point", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                }
            }]
        }
    });

    map.addLayer({
        "id": "point",
        "type": "circle",
        "source": "point",
        "paint": {
            "circle-radius": 5,
            "circle-color": "#3887be"
        }
    });	
}

function drawStvrte( pole, color, id){	
	map.addSource(id, {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
			 "features": pole
            }
    });
	
    map.addLayer({
        'id': id,
        'type': 'fill',
        'source': id,
        'layout': {},
        'paint': {
            'fill-color': color,
            'fill-opacity': 0.4
        }
    });
}

function callbackstvrte(response){
	clearStvrte(map);	
	var obj1 = response[0];
	var min = obj1.count;
	var dlzka = dlzkaObjektu(response)-1;
	obj1 = response[dlzka];
	var max = obj1.count;
	var rozsah = max-min;
	max = 10-(rozsah%10)+rozsah;
	rozsah=max/5;
	var element = document.getElementById("firstRow");
	var up = rozsah-1;
	element.innerHTML = "0 - " + up;
	var element = document.getElementById("secondRow");
	var down =up+1;
	var up =down+rozsah-1;
	element.innerHTML = down+ " - " + up;
	var element = document.getElementById("thirdRow");
	var down =up+1;
	var up =down+rozsah-1;
	element.innerHTML = down+ " - " + up;
	var element = document.getElementById("fourthRow");
	var down =up+1;
	var up =down+rozsah-1;
	element.innerHTML = down+ " - " + up;
	var element = document.getElementById("fifthRow");
	var down =up+1;
	var up =down+rozsah-1;
	element.innerHTML = down+ " - " + up;
	var farby = ['#FF0000', '#ff8000','#ffff00','#bfff00','#80ff00'];
	var ids = ["first", "second","third","fourth","fifth"];
	var j=0;
		
	for (i = 0; i < 5; i++) {
		var vyskoc = 0;
		var odosli=[];	
		while (vyskoc!=1){
			if (dlzkaObjektu(response)<=j)
				break;
			if (response[j].count<(rozsah*(i+1))){
				var feature = {
				"type": "Feature",
				"geometry": response[j].geometry
				};
				odosli.push(feature);
				j++;
			}
			else
				vyskoc=1;
		}
		drawStvrte (odosli, farby[i], ids[i]);
	}
	var obj =response[15].geometry;
	
	var element = document.getElementById("colorTable");
	element.style.visibility = "visible";
}

function callbackshowblines (response){

	remove("busstops");
	remove ("lines");
	var prazdnota=0;
	if (response[0]!=null){
		map.addSource("busstops", {
			"type": "geojson",
			"data": {
				"type": "FeatureCollection",
				"features":response[0]
			}
		});

		map.addLayer({
			"id": "busstops",
			"type": "symbol",
			"source": "busstops",
			"layout": {
				"icon-image": "{icon}-15",
				"text-field": "{title}",
				"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
				"text-offset": [0, 0.6],
				"text-anchor": "top",
				"icon-allow-overlap": true
			}
		});

		map.addSource("lines", {
			"type": "geojson",
			"data": {
				"type": "FeatureCollection",
				"features":response[1]
			}
		});
	
		map.addLayer({
			"id": "lines",
			"type": "line",
			"source": "lines",
			"layout": {
				"line-join": "round",
				"line-cap": "round"
			},
			"paint": {
				"line-color": "#008000",
				"line-width": 3
			}
		});
	}
}

function callbackallparking(response){	
	remove ("garaze");		
	var i=0;
	var dlzka=dlzkaObjektu(response);
	var features=[];
	while (i<dlzka){
		var feature = {
			"type": "Feature",
			"geometry": response[i].geometry,
			"properties": {
                   "icon": "car"
			}
		};
		features.push(feature);
		i++;
	}
	if (features.length!=0){
	map.addSource("garaze", {
		"type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features":features
        }
    });
	
    map.addLayer({
        "id": "garaze",
        "type": "symbol",
        "source": "garaze",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
			"icon-allow-overlap": true
        }
    });
	}
}

function callbacknearest(response){
		remove("garaz");		
		var obj1 = response[0];
		
		if(obj1.properties.name==null)
			obj1.properties.name="No Name"

		map.addSource("garaz", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features":[{
				"type": "Feature",
				"geometry": obj1.geometry,
				"properties": {
                    "title": obj1.properties.name,
                    "icon": "car"
                }
			}]
        }
    });

    map.addLayer({
        "id": "garaz",
        "type": "symbol",
        "source": "garaz",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
			"icon-allow-overlap": true
        }
    });	
}

function NearestClicked(){
	$.ajax({
    type: "POST",
    url: "http://127.0.0.1:80/app/API/getNearest.php",
	data:{lat : lat, lng : lng},
	success:callbacknearest
	});
}

function showStvrte(){
	$.ajax({
    type: "POST",
    url: "http://127.0.0.1:80/app/API/getRatio.php",
	data:{lat : "nic"},
	success:callbackstvrte
	});
}

function findBusAndLines(dist, feature){
	lng = feature.geometry.coordinates[0];
	lat = feature.geometry.coordinates[1];
	$.ajax({
    type: "POST",
    url: "http://127.0.0.1:80/app/API/getStopAndLines.php",
	data:{lat : lat, lng : lng, dist : dist},
	success:callbackshowblines
	});
}

function findAll(){
	var element = document.getElementById("radiusTB");
	var dist = element.value;
	$.ajax({
    type: "POST",
    url: "http://127.0.0.1:80/app/API/getAllNearest.php",
	data:{lat : lat, lng : lng, dist : dist},
	success:callbackallparking
	});
}	
	
function clearStvrte(map){
	remove("first");
	remove("second");
	remove("third");
	remove("fourth");
	remove("fifth");
}

function remove(id){
	if (map.getLayer(id)){
		map.removeLayer(id);
		map.removeSource(id);
	}	
}

function ClearAll(map){	
	clearStvrte(map);
	remove("point");
	remove("garaz");
	remove("garaze");
	remove("busstops");
	remove("lines");
	lat=500;
	var element = document.getElementById("colorTable");
	element.style.visibility = "hidden";
}
	
var lat=500;
var lng=500;
var popup = new mapboxgl.Popup({
			closeButton: false,
			closeOnClick: false
			});

$(document).ready(function () {
			
	map.on('click', function (e) {
		if (map.getLayer("garaze") || map.getLayer("garaz")){
			if (map.getLayer("garaze"))
				var features = map.queryRenderedFeatures(e.point, { layers: ['garaze'] });
			else if (map.getLayer("garaz"))
				var features = map.queryRenderedFeatures(e.point, { layers: ['garaz'] });
			if (!features.length) {
			}
			else{
				var dist = prompt("V akej vzdialenosti chcete vyhľadať cyklochodníky a zastávky? (Zadajte v metroch) ", "100");
				if (dist != null) {
					var feature = features[0];		
					findBusAndLines(dist, feature);		
				}
			}
		}
		var element = document.getElementById("checkBox");
		if (element.checked==true){
			lat = e.lngLat['lat'];
			lng = e.lngLat['lng'];
			addPoint(this, lat, lng);		
		}		
    });
    
	$('#findAll').on('click', function () {
		if (lat==500){
			alert("Najprv zadajte vyhladavaci bod");
		}
		else
		findAll();	
	});
	
	$('#btnNearest').on('click', function () {
		if (lat==500){
			alert("Najprv zadajte vyhladavaci bod");
		}
		else
			NearestClicked();	
	});
	
	$('#showStvrte').on('click', function () {
		showStvrte();	
	});
	
	$('#Clear').on('click', function () {
		ClearAll(map);	
	});
		
	map.on('mousemove', function (e) {		
		popup.remove();
		if (map.getLayer("garaz")){
			var features = map.queryRenderedFeatures(e.point, { layers: ['garaz'] });
				map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
		}
		if (map.getLayer("garaze")){
			var features = map.queryRenderedFeatures(e.point, { layers: ['garaze'] });
				map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
		}
		if (map.getLayer("busstops")||map.getLayer("lines")){
			var features = map.queryRenderedFeatures(e.point, { layers: ['busstops','lines'] });
			map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
			if (!features.length) {
				popup.remove();		
			}
			else{
				var feature = features[0];
			popup.setLngLat(e.lngLat)
			.setHTML(feature.properties.name)
			.addTo(map);
			}
		}		
	});
});