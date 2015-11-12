/* global google */
(function (document) {
  'use strict';

  var app = document.querySelector('#app');
  app.showSpinner = true;

  app.clusterNames = ['Western Europe', 'Relicts', 'Germany', 'Northern Sweden', 'Iberian Peninsula', 'Central Asia', 'Southern Sweden', 'Italy, Balkans, Caucasus', 'Central Europe'];

  app.displayInstalledToast = function () {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!document.querySelector('platinum-sw-cache').disabled) {
      document.querySelector('#caching-complete').show();
    }
  };



  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function () {
    app.$.mapelement.addEventListener('google-map-ready', function () {
      app.initFusionLayer();
    });
  });

  app.populations = [
    { label: 'Western Europe (117)', color: '#5781fc' },
    { label: 'Relict (25)', color: '#00e03d', isRelic: true },
    { label: 'Germany (171)', color: '#55d8d8' },
    { label: 'North Sweden (64)', color: '#ff9d00' },
    { label: 'Iberian Peninsula (110)', color: '#e04d9d' },
    { label: 'Central Asia (79)', color: '#7d55fc' },
    { label: 'South Sweden (156)', color: '#fc6355' },
    { label: 'Italy, Balkans, Caucasus (92)', color: 'white' },
    { label: 'Central Europe (184)', color: '#fbf358' }
  ];

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function () {

  });

  app.toggleSettings = function () {
    this.$.settingsMenu.toggle();
  };
  app.openInfoWindow = function () {
    app.$.infoDialog.open();
  };
  app.googleMapLoaded = function () {
    this.mapLoaded = true;
  };
  app.initFusionLayer = function () {
    var layer = new google.maps.FusionTablesLayer({
      query: {
        select: '\'latitude\'',
        from: '1JawTH1dEup1Ie2XRlPFTND2aO9UrbGBLBUgwX1jj',
      },
      options: {
        styleId: 2,
        templateId: 2
      }
    });
    layer.setMap(app.$.mapelement.map);
    google.maps.event.addListener(layer, 'click', function (e) {
      // Change the content of the InfoWindow
      e.infoWindowHtml = app._getInfoWIndowContent(e.row);
    });
  };

  app._getInfoWIndowContent = function (row) {
    return '<b>id:</b> ' + row.id.value + '<br>' +
      '<b>name:</b> ' + row.name.value + '<br>' +
      '<b>country:</b> ' + row.country.value + '<br>' +
      '<b>sitename:</b> ' + row.sitename.value + '<br>' +
      '<b>group:</b> ' + row.population.value + '<br>'
      ;
  };
  app._hideChrSetting = function (chrs) {
    return chrs.length === 1;
  };
  app._sortPopulations = function (a, b) {
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
  app._getMarkersFromFusion = function (response) {
    var markers = [];
    //var response = event.detail.response;
    if (response === null) {
      return markers;
    }
    var K = parseInt(this.activek);
    var numRows = response.rows.length;
    for (var i = 0; i < numRows; i++) {
      var Kvalues = [];
      var row = response.rows[i];
      var accId = row[0];
      var name = row[1];
      var lng = row[2];
      var lat = row[3];
      var coordinate = new google.maps.LatLng(lat, lng);
      for (var j = 0; j < K; j++) {
        Kvalues.push(row[(j + 4)] * 100);
      }
      var marker = document.createElement('admixture-marker');
      var customColors = null;
      if (K === 9) {
        customColors = this.populations.map(function (item) { return item.color; });
      }
      marker.position = coordinate;
      marker.colors = customColors;
      marker.data = Kvalues;
      marker.accId = accId;
      marker.name = name;
      markers.push(marker);
    }
    this.showSpinner = false;
    //this.markers = markers;
    return markers;
  };
  app._convertToInt = function (value) {
    return parseInt(value);
  };
})(document);
