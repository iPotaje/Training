angular
.module("theApp")

.directive("ipMap", function($window)
{
	return {
		compile: function (element, attr){
			element.css({
				'position'	 : 'absolute',
				'top' 	 	 : '0',
				'bottom'     : '0',
				'left'       : '0',
				'right'		 : '0',
				'display'    : 'block'
			});
			element.attr('id','map');
			console.log(element);
			
			$window.ipMap = L.map('map').setView([51.505, -0.09], 13);

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(ipMap);


		L.marker([51.5, -0.09]).addTo(ipMap)
			.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

		var popup = L.popup();

		function onMapClick(e) {
			popup
				.setLatLng(e.latlng)
				.setContent("You clicked the map at " + e.latlng.toString())
				.openOn(ipMap);
		}

		ipMap.on('click', onMapClick);


		}
	}
})
;