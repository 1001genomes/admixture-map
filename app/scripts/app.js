/* global google */
/* global Polymer */
(function(document) {
  'use strict';

  var app = document.querySelector('#app');
  app.showSpinner = true;
  app.populationMarkers = null;

  app.clusterNames = ['Western Europe', 'Relicts',
                      'Germany', 'Northern Sweden',
                      'Iberian Peninsula', 'Central Asia',
                      'Southern Sweden', 'Italy, Balkans, Caucasus',
                      'Central Europe'];

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    app.$.mapelement.addEventListener('google-map-ready', function() {
      if (app.populationMarkers !== null) {
        for (var i = 0; i < app.populationMarkers.length; i++) {
          var marker = app.populationMarkers[i];
          marker.setMap(app.$.mapelement.map);
        }
      }
    });
  });

  app.populations = [
    {label: 'Western Europe (117)', color: '#5781fc'},
    {label: 'Relict (25)', color: '#00e03d', isRelic: true},
    {label: 'Germany (171)', color: '#55d8d8'},
    {label: 'North Sweden (64)', color: '#ff9d00'},
    {label: 'Iberian Peninsula (110)', color: '#e04d9d'},
    {label: 'Central Asia (79)', color: '#7d55fc'},
    {label: 'South Sweden (156)', color: '#fc6355'},
    {label: 'Italy, Balkans, Caucasus (92)', color: 'white'},
    {label: 'Central Europe (184)', color: '#fbf358'}
  ];

  app.populationsColormap = {
    'western_europe': '#5781fc',
    'relict': '#00e03d',
    'germany': '#55d8d8',
    'central_europe': '#fbf358',
    'asia': '#7d55fc',
    'south_sweden': '#fc6355',
    'north_sweden': '#ff9d00',
    'spain': '#e04d9d',
    'italy_balkan_caucasus': 'white'
  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {

  });

  app.toggleSettings = function() {
    this.$.settingsMenu.toggle();
  };
  app.openInfoWindow = function() {
    app.$.infoDialog.open();
  };
  app.googleMapLoaded = function() {
    this.mapLoaded = true;
  };
  app._clickPopMaker = function() {
    var infowindow = new google.maps.InfoWindow({
      content: app._getInfoWIndowContent(this.accession)
    });
    infowindow.open(app.$.mapelement.map,this);
  };
  /* jshint ignore:start */
  app._aIcon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z';
  /* jshint ignore:end */
  app._initPopulationMarkers = function(accessions) {
    if (this.populationMarkers !== null) {
      return;
    }
    this.populationMarkers = [];
    for (var i = 0; i < accessions.length; i++) {
      var accession = accessions[i];
      var icon = null;
      if (accession.group === 'admixed') {
        icon = {
          path: app._aIcon,
          fillColor: 'black',
          strokeColor: 'black',
          strokeWeight: 1.3,
          scale: 0.6,
        };
      } else {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: app.populationsColormap[accession.group],
          fillOpacity: 1,
          strokeColor: 'black',
          strokeWeight: 1
        };
      }
      var marker = new google.maps.Marker({
        position: accession.coordinate,
        icon: icon,
        draggable: false,
        map: app.$.mapelement.map,
        accession: accession
      });
      marker.addListener('click', app._clickPopMaker);
      this.populationMarkers.push(marker);
    }
  };

  app._getInfoWIndowContent = function(accession) {
    return '<b>id:</b> ' + accession.id + '<br>' +
      '<b>name:</b> ' + accession.name + '<br>' +
      '<b>country:</b> ' + accession.country + '<br>' +
      '<b>sitename:</b> ' + accession.sitename + '<br>' +
      '<b>group:</b> ' + accession.group + '<br>'
      ;
  };
  app._hideChrSetting = function(chrs) {
    return chrs.length === 1;
  };
  app._sortPopulations = function(a, b) {
    if (a.isRelic === true) {
      return 1;
    }
    if (b.isRelic === true) {
      return -1;
    }
    return 0;
  };
  app.changeKSetting = function() {
    this.showSpinner = true;
  };
  app._getMarkersFromFusion = function(response) {
    var markers = [];
    var accessions = [];
    //var response = event.detail.response;
    if (response === null) {
      return markers;
    }
    var K = parseInt(this.activek);
    var valueRanges = response.valueRanges;
    var numRows = valueRanges[0].values.length;
    for (var i = 1; i < numRows; i++) {
      var Kvalues = [];
      var accId = parseInt(valueRanges[0].values[i][0]);
      var name = valueRanges[1].values[i][0];
      var lng = parseFloat(valueRanges[2].values[i][0]);
      var lat = parseFloat(valueRanges[3].values[i][0]);
      var country = valueRanges[4].values[i][0];
      var sitename = valueRanges[5].values[i][0];
      var group = valueRanges[6].values[i][0];
      var coordinate = new google.maps.LatLng(lat, lng);
      for (var j = 0; j < K; j++) {
        Kvalues.push(parseFloat(valueRanges[(j + 7)].values[i][0]) * 100);
      }
      var marker = document.createElement('admixture-marker');
      var customColors = null;
      if (K === 9) {
        customColors = this.populations.map(function(item) { return item.color; });
      }
      marker.position = coordinate;
      marker.colors = customColors;
      marker.data = Kvalues;
      marker.accId = accId;
      marker.name = name;
      markers.push(marker);
      accessions.push({id: accId, name: name, country: country,
                       sitename: sitename, group: group, coordinate: coordinate
                      });
    }
    this.showSpinner = false;
    this._initPopulationMarkers(accessions);
    //this.markers = markers;
    return markers;
  };
  app._convertToInt = function(value) {
    return parseInt(value);
  };
})(document);
