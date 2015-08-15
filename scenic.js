var centerX;
var centerY;
var radius;
var startX;
var startY;
var endX;
var endY;
$(document).on("pageshow", "#map", function ()
{
	$(".ui-content", this).css({
		height: $(window).height(),
		width: $(window).width()
	});
	var map;
	navigator.geolocation.getCurrentPosition(geoLocateOnSuccess, geoLocateOnError);
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
			map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

			var marker = new google.maps.Marker({
					position: new google.maps.LatLng(latitude, longitude),
					map: map,
					title: 'Hello World!'
			});


			var service = new google.maps.places.PlacesService(map);
			service.nearbySearch({
				location: {lat: latitude, lng: longitude},
				radius: 1500,
				types: ['hindu_temple', 'park', 'mosque', 'synagogue', 
				'university']
			}, onServiceSuccess);
	}

	function onServiceSuccess(results, status)
	{
		if (status === google.maps.places.PlacesServiceStatus.OK)
		{
			for (var i = 0; i < results.length; i++)
			{
				createMarker(results[i]);
			};
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

	function geoLocateOnSuccess(position)
	{
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			buildMap(latitude, longitude)
	}
	function geoLocateOnError(error)
	{
		alert('code: ' + error.code+ '\n' + 'message: ' + error.message + '\n');
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