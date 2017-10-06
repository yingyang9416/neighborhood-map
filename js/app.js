// Initial place Data
var places = [
  { name: 'Ohio State University',
    position: {lat: 40.0141946, lng: -83.033103},
    venueId: '4b92d078f964a520451e34e3'
  },
  { name: 'Newport Music hall',
    position: {lat: 39.9972716, lng: -83.0078976 },
    venueId: '4b05864af964a520c75a22e3'
  },
  { name: 'Lemongrass Fusion Bistro',
    position: {lat: 39.9752971, lng: -83.005504},
    venueId: '4b511f0cf964a520864327e3'
  },
  { name: 'Coco Grill',
    position: {lat: 39.9875121, lng: -83.030489},
    venueId: '4b7874ccf964a520a0cf2ee3'
  },
  { name: 'Ibel Agency',
    position: {lat: 39.9679362, lng: -82.9983452},
    venueId: '4f2fe682e4b007725cf24ac6'
  },
  { name: 'Columbus State Community College',
    position: {lat: 39.9644161, lng: -82.9995881},
    venueId: '50b76fffe4b023fe0024efad'
  },

];


// Display Map
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 39.9752971, lng: -83.005504}
  });
  // Activate Knockout
  ko.applyBindings(new viewModel());
}

// Error Call for Google Maps
// Use onerror="googleError" in script tag for google maps in html
function googleError() {
  alert('Google Maps has failed to load at this time.');
}


var viewModel = function() {

  // Optimize JavaScript
  "use strict";

  // Reference scope of another object in order to
  // remain availabe and consistent
  var self = this;

  // Create an observable for place list
  self.placeList = ko.observableArray(places);

  // Create a viewModel function that operates on the marker
  // to open its infowindow and make it animate.
  self.placeList().forEach(function(placeItem) {

    // Create markers
    var marker = new google.maps.Marker({
      title: placeItem.name,
      position: placeItem.position,
      animation: google.maps.Animation.DROP,
      map: map
    });

    // Reference to the marker in you place object (item)
    placeItem.marker = marker;

    //Invoke Foursquare Function
    getFoursquareData(placeItem);

    // Create single infoWindow for each place
    self.infoWindow = new google.maps.InfoWindow();

    // Create event listener to animate marker
    // and open infowindow when clicked
    marker.addListener('click', function() {
      // self.selectPlace(select);
      self.infoWindow.setContent(placeItem.contentInfo);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 750);
      self.infoWindow.open(map, marker);
    });
  });

  // Create an observable for filter input
  self.filter = ko.observable("");

  // Create filter input function to update filter list
  self.filteredItems = ko.computed(function() {
    return ko.utils.arrayFilter(self.placeList(), function(item) {
      var visible = item.name.toLowerCase().indexOf(self.filter().toLowerCase()) != -1;
      if (visible) {
        item.marker.setVisible(visible);
      } else {
        item.marker.setVisible(false);
      }
      return visible;
    });
  });

  // make a selectPlace function that
  // animates the marker and opens its info
  self.selectPlace = function(select) {
    select.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      select.marker.setAnimation(null);
    }, 750);
    self.infoWindow.setContent(select.contentInfo);
    self.infoWindow.open(map, select.marker);
  };


  // Foursquare API
  function getFoursquareData(data) {

    var Client_id = 'RUZLV3GHQDKAWSMUAZ12ZCRTAK0J0PG3MWNDFMELFXZ1S2G1';
    var Client_secret = '2W5V52B3CZS03RQAQGSERKEXZN4MYZQOLJ3FNSGDLP4OWT2H';

    // Foursquare v parameter in date YYYYMMDD format.
    var v = '20170805';
    var foursquareVenueId = data.venueId;
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/'+ foursquareVenueId +
    '?client_id=' + Client_id + '&client_secret=' + Client_secret + '&v=' + v;

    // Exchange and store data from Foursquare's third party API
    $.ajax({
      url: foursquareUrl,
      success: function(response) {
        var foursquareLink = response.response.venue.canonicalUrl;
        var foursquarePhone = response.response.venue.contact.phone;
        var foursquareAddress = response.response.venue.location.formattedAddress;
        data.contentInfo = '<h4 id="heading">' + data.name + '</h4>'+
        '<h6>Phone: ' + foursquarePhone + '</h6>' + '<h6>' + foursquareAddress + '</h6>' +
        '<h6 id="foursquareInfo"><a id="foursquareLink" href="' +
        foursquareLink + '" target="_blank">Foursquare</a></h6>';
      },
      error: function() {
        data.contentInfo = '<h6>Failed to load Foursquare data</h6>';
      }
    });
  }
};
