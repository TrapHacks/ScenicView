var centerlat;
var centerlong;
var radius;
var startlat=0;
var startlng=0;
var endlng = 0;
var endlat = 0;
var boolaray = [];
var opened = [];
var _results;

function geoLocate()
{
	navigator.geolocation.getCurrentPosition(geoLocateOnSuccess, geoLocateOnError);

}

function geoLocateOnSuccess(position)
{
		startlat = position.coords.latitude;
		startlng = position.coords.longitude;
		document.getElementById('autocompleteOrigin').value='Current Location'
}

function geoLocateOnError(error)
{
	startlat = 0;
	startlng = 0;
	//alert('code: ' + error.code+ '\n' + 'message: ' + error.message + '\n');
}

function computeCenterAndRadius()
{
	centerlat = (startlat + endlat)/2;
	centerlng = (startlng + endlng)/2;
	radius = getDistance({lat:startlat, lng:startlng}, {lat:endlat, lng: endlng})/2
}

var rad = function(x) {
	return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = rad(p2.lat - p1.lat);
	var dLong = rad(p2.lng - p1.lng);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
};


function pinSymbol(color) {
	return {
		path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
		fillColor: color,
		fillOpacity: 1,
		strokeColor: '#000',
		strokeWeight: 2,
		scale: 1,
 };
}


$(document).on("pageshow", "#map", function ()
{
	$(".ui-content", this).css({
		height: $(window).height(),
		width: $(window).width()
	});
	computeCenterAndRadius()
	buildMap(centerlat,centerlng)
	var map;
	var infowindow;
	function buildMap(latitude, longitude)
	{

		infowindow = new google.maps.InfoWindow(
	  { 
	    size: new google.maps.Size(150,50)
	  });
		//Making the Google Map
		var mapOptions = {
				center: new google.maps.LatLng(latitude, longitude),
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: false,
				streetViewControl: false,
				panControl: false,
				zoomControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				}
		};

		map = new google.maps.Map($("#map-canvas")[0],
		mapOptions);


		var latLngList = new Array(new google.maps.LatLng(startlat, startlng), new google.maps.LatLng(endlat, endlng));
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < latLngList.length; i++) {
			bounds.extend(latLngList[i]);
		};

		map.fitBounds(bounds);


		var marker = new google.maps.Marker({
				position: new google.maps.LatLng(endlat, endlng),
				map: map,
				title: 'Destination',
				icon: pinSymbol('#D5691C')
		});

		/* Centroid 
		var marker = new google.maps.Marker({
				position: new google.maps.LatLng(latitude, longitude),
				map: map,
				title: 'Hello World!'
		});
		*/

		var marker = new google.maps.Marker({
				position: new google.maps.LatLng(startlat, startlng),
				map: map,
				title: 'Origin',
				icon: pinSymbol('#321CD5')

		});


		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: {lat: latitude, lng: longitude},
			radius: radius,
			types: ['hindu_temple', 'park', 'mosque', 'synagogue', 
			'university']
		}, onServiceSuccess);
	}


	function onServiceSuccess(results, status)
	{
		if (status === google.maps.places.PlacesServiceStatus.OK)
		{
			if(true){

					if( Math.abs(endlat-startlat) > Math.abs(endlng-startlng))
					{
						if(startlat<endlat)
						{
							_results = results.sort(function(a, b){
								var keyA = a.geometry.location.lat();
								var keyB = b.geometry.location.lat();
						    if(keyA > keyB) return -1;
								if(keyA < keyB) return 1;
								return 0;
							});
						}
						else
						{
							_results = results.sort(function(a, b){
								var keyA = a.geometry.location.lat();
								var keyB = b.geometry.location.lat();
						    if(keyA < keyB) return -1;
								if(keyA > keyB) return 1;
								return 0;
							});
						}
					}
					else
					{
						if(startlng<endlng)
						{
							_results = results.sort(function(a, b){
								var keyA = a.geometry.location.lng();
								var keyB = b.geometry.location.lng();
						    if(keyA > keyB) return -1;
								if(keyA < keyB) return 1;
								return 0;
							});
						}
						else
						{
							_results = results.sort(function(a, b){
								var keyA = a.geometry.location.lng();
								var keyB = b.geometry.location.lng();
						    if(keyA < keyB) return -1;
								if(keyA > keyB) return 1;
								return 0;
							});
						}
					}
		
					results = _results;
				for (var i = 0; i < results.length; i++)
				{
					createMarker(results[i],i);
				};
					google.maps.event.addListenerOnce(map, 'idle', function (e)
					{
						$("#map-canvas").append($("<a href='#' data-role='button' data-rel='back' class='forMap'>Back</a>").hide().fadeIn(700));
						$(".forMap").buttonMarkup({
							mini: true,
							inline: true,
							theme: "e",
							iconpos: "notext",
							icon:"home"
						});


					});
					
					// _results = results;

						// _results = results.sort(function(a, b){
						// 		var keyA = a.geometry.location.lat();
						// 		var keyB = b.geometry.location.lat();
						//     if(keyA > keyB) return -1;
						// 		if(keyA < keyB) return 1;
						// 		return 0;
						// 	});
						
				// console.log(document.getElementById('xLink'));

				// document.getElementById('xLink').href = buildUrl(results, document.getElementById('autocompleteOrigin').value, document.getElementById('autocompleteDestination').value);
			}

		}
	}

	function createMarker(place, i) {
		console.log('from createMarker');
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: pinSymbol('#0C8428')
		});


		boolaray[i] = false
		opened[i] = false
		google.maps.event.addListener(marker, 'click', function() {
			if(opened[i])
			{
				boolaray[i] = !boolaray[i];
				if(boolaray[i]){
		    	marker.setAnimation(google.maps.Animation.BOUNCE);
		    }

		    else{
		    	marker.setAnimation(null);
		    }

			}
			else
			{
				for (var j = 0; j < opened.length; j++) {
						opened[j] = false;
				}
				opened[i] = true

				infowindow.setContent(place.name);
				infowindow.open(map, this);
			}
		});
	}

	google.maps.event.addListener(map, 'dragstart', function (e)
	{
		$(".forMap").animate({
				"opacity": 0.3
		}, 300);
	});

	google.maps.event.addListener(map, 'dragend', function (e)
	{
		$(".forMap").animate({
			"opacity": 1
		}, 700);
	});
});


var placeSearch, autocompleteDestination, autocompleteOrigin;
var componentForm = {
	street_number: 'short_name',
	route: 'long_name',
	locality: 'long_name',
	administrative_area_level_1: 'short_name',
	country: 'long_name',
	postal_code: 'short_name'
};

function initAutocomplete() {
	// Create the autocomplete object, restricting the search to geographical
	// location types.

	autocompleteOrigin = new google.maps.places.Autocomplete(
			/** @type {!HTMLInputElement} */(document.getElementById('autocompleteOrigin')),
			{types: ['geocode']}); 
	autocompleteOrigin.addListener('place_changed',
		fillInAddressOrigin)
	autocompleteDestination = new google.maps.places.Autocomplete(
			/** @type {!HTMLInputElement} */(document.getElementById('autocompleteDestination')),
			{types: ['geocode']});

	// When the user selects an address from the dropdown, populate the address
	// fields in the form.
	autocompleteDestination.addListener('place_changed', fillInAddressDestination);
}

// [START region_fillform]
function fillInAddressOrigin() {
	// Get the place details from the autocomplete object.
	var place = autocompleteOrigin.getPlace();
	startlat = place.geometry.location.lat();
	startlng = place.geometry.location.lng();
}

function fillInAddressDestination() {
	// Get the place details from the autocomplete object.
	var place = autocompleteDestination.getPlace();
	endlat = place.geometry.location.lat();
	endlng = place.geometry.location.lng();

}

function buildUrl(places, origin, destination){
	//Build the url to send back to client
	var baseUrl = 'https://www.google.com/maps/dir';
	baseUrl += '/' + startlat + ',' + startlng;
	for (var i = 0; i < places.length; i++) {
		if (boolaray[i]){
			// baseUrl += '/' + places[i].name.split(' ').join('+') ;
			// console.log(places[i].name);
			baseUrl += '/' + places[i].geometry.location.lat() + ',' + places[i].geometry.location.lng();

		}
	}
	baseUrl += '/' + endlat + ',' +endlng;
	_results = null;
	window.location.replace(baseUrl);
}


