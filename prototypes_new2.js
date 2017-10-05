var map;
var markers=[];

// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [
        {title: 'ohio state university', location: {lat: 40.0141946, lng: -83.033103}},
        {title: 'newport music hall', location: {lat: 39.9972716, lng: -83.0078976}},
        {title: 'kroger', location: {lat: 39.9889493, lng: -83.0122052}},
        {title: 'buca di beppo italian restaurant', location: {lat: 39.9685604, lng: -83.010317}},
        {title: 'z cucina di spirito', location: {lat: 39.9780321, lng: -83.0461084}},
        {title: 'columbus state community college', location: {lat: 39.9644161, lng: -82.9995881}},
      ];
var view = function(list){
  this.title = ko.observable(list.title);
  this.show = ko.observable(true);
};

var ViewModel = {
  init: function() {
    var self = this;

    this.locationList = ko.observableArray([]);
    locations.forEach(function(Item){
      self.locationList.push(new view(Item));
    });

    this.selectedPlace = function() {
      var marker = this.marker;
      google.maps.event.trigger(marker, 'click');
    };

    this.inputValue = ko.observable('');
    this.filteredPlaces = ko.computed(function(){
      var filter = self.inputValue();
      for (var i = 0; i<self.locationList().length; i++){
        if (self.locationList()[i].title().includes(filter) === true){
          self.locationList()[i].show(true);
          console.log(self.locationList()[i]);
          if (self.locationList()[i].marker !== undefined){
            self.locationList()[i].marker.setVisible(true);
          }
        } else {
          self.locationList()[i].show(false);
           self.locationList()[i].marker.setVisible(false);
        }
      }
    });


    this.renderMap = function() {
      // use a constructor to create a new map JS object. Use the coordinates
      map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 39.997817, lng: -83.008826},
        zoom: 12
      });

      var largeInfowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();

      // Loop through the locations
      for (var i = 0; i<locations.length; i++){
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
          position: position,
          title: title,
          map: map,
          animation: google.maps.Animation.DROP,
          id: i
        });
        // push the marker into the markers array
        markers.push(marker);
        // extend the boundaries of the map for each marker
        bounds.extend(marker.position);
        // onclick event
        marker.addListener('click',function(){
          populateInfoWindow(this,largeInfowindow);
        });
      }
      map.fitBounds(bounds);
    }



  }
}



var viewModel = new ViewModel.init();
ko.applyBindings(viewModel);


function initMap() {
  viewModel.renderMap();
}



function populateInfoWindow(marker, infowindow){
  // make sure info window is not already opened
  if (infowindow.marker != marker){
    infowindow.marker = marker;
    infowindow.setContent('<div>'+marker.title+'</div>');
    // make sure the marker is cleared if the info window is closed
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker(null);
    });
    infowindow.open(map, marker);
  }
}
