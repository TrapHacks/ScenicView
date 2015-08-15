var centerlat;
var centerlong;
var radius;
var startlat;
var startlng;
var endlng = 0;
var endlat = 0;
navigator.geolocation.getCurrentPosition(geoLocateOnSuccess, geoLocateOnError);


function geoLocateOnSuccess(position)
{
		startlat = position.coords.latitude;
		startlng = position.coords.longitude;
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



$(document).on("pageshow", "#map", function ()
{
	$(".ui-content", this).css({
		height: $(window).height(),
		width: $(window).width()
	});
	computeCenterAndRadius()
	buildMap(centerlat,centerlng)
	var map;
	function buildMap(latitude, longitude)
	{
			//Making the Google Map
			var mapOptions = {
					center: new google.maps.LatLng(latitude, longitude),
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.HYBRID,
					mapTypeControl: false,
					streetViewControl: false,
					panControl: false,
					zoomControlOptions: {
							position: google.maps.ControlPosition.RIGHT_BOTTOM
					}
			};
			map = new google.maps.Map($("#map-canvas")[0],
			mapOptions);
			map.setMapTypeId(google.maps.MapTypeId.ROADMAP);


			var marker = new google.maps.Marker({
					position: new google.maps.LatLng(endlat, endlng),
					map: map,
					title: 'Destination'
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
					title: 'Origin'
			});


			var service = new google.maps.places.PlacesService(map);
			service.nearbySearch({
				location: {lat: latitude, lng: longitude},
				radius: radius,
				types: ['hindu_temple', 'park', 'mosque', 'synagogue', 
				'university']
			}, onServiceSuccess);
	}

	/*
		list of places !!
	*/
	function onServiceSuccess(results, status)
	{
		if (status === google.maps.places.PlacesServiceStatus.OK)
		{
			if(true){
				for (var i = 0; i < results.length; i++)
				{
					createMarker(results[i]);
				};

				buildUrl(results);
			}



		}
	}

	function createMarker(place) {
		console.log('from createMarker');
	  var placeLoc = place.geometry.location;
	  var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	  });

	  google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	  });
	}
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

function buildUrl(places){
	//Build the url to send back to client 
	var baseUrl = 'www.google.com/maps/dir';
	for (var i = 0; i < places.length; i++) {
		baseUrl += '/' + places[i].name.split(' ').join('+') ;
	};

	console.log(baseUrl);
	return baseUrl;
}

