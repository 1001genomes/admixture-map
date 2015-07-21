/* global google */
/* global d3 */
(function (document) {
  'use strict';

  var app = document.querySelector('#app');

  app.apiKey = 'AIzaSyB1GbyVSIOK12RJbFMkaIJjwhVNG-b8fjc';
  app.dataSources = [{value:'11w8bumbRj9R-lmdPa4tBCrf_7VDloDTG5jJTPg-w',name:'admixture FG3 1153',description:'1001 genomes: admixiture full genome version 3, 1153 accessions'},
{value:'1LElwc9J3jDq_BfzxU9JzFYMb0HgKIsHkqlo-R3GR',name:'admixture identical individuals imputed',description:'1001genomes: admixture; 1146 accessions; identicals removed and imputed; no singletons; ld pruning to r^2 = 0.1'},
                              {value:'19f1j8Gn-9zWP0q57H-uZhay10BEUQMejetutqDEG',name:'admixture all indiviudals',description:'1001 genomes: admixture; 1211 accessions; ld pruning to r^2 = 0.3'}];

  app.displayInstalledToast = function () {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function () {

  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function () {
    // imports are loaded and elements have been registered
  });


  app.handleFusionResponse = function (event) {
    var markers = [];
    var response = event.detail.response;
    var numRows = response.rows.length;
    for (var i = 0; i < numRows; i++) {
      var Kvalues = [];
      var row = response.rows[i];
      var accId = row[0];
      var name = row[1];
      var lng = row[2];
      var lat = row[3];
      var coordinate = new google.maps.LatLng(lat, lng);
      for (var j = 0; j < this.K; j++) {
        Kvalues.push(row[(j + 4)] * 100);
      }
      var marker = document.createElement('admixture-marker');
      marker.position = coordinate;
      marker.data = Kvalues;
      marker.accId = accId;
      marker.name = name;
      markers.push(marker);
    }
    this.markers = markers;
  };
  app.handleFusionMetaResponse = function (event) {
    var response = event.detail.response;
    var Ks = [];
    var chrs = [];
    for (var i = 0; i < response.items.length; i++) {
      var column = response.items[i].name;
      var parts = column.split('\.');
      if (parts.length === 3) {
        Ks.push(parts[0].substr(1));
        chrs.push(parts[1].substr(3));
      }
    }
    Ks = d3.set(Ks).values();
    chrs = d3.set(chrs).values();
    this.ks = Ks;
    this.chrs = chrs;
    this.K = this.K || 8;
    this.chr = this.chrs[0];
    this.fetchData();
  };
  app.initControls = function () {
    var query = 'https://www.googleapis.com/fusiontables/v1/tables/' + this.dataSources[0].value + '/columns?maxResults=0&key=' + this.apiKey;
    this.$.datasourceMeta.url = query;
    this.$.datasourceMeta.generateRequest();
  };
  app.fetchData = function () {
    var query = 'SELECT ecotypeid,name,longitude,latitude,' + this._getColumnFromSettings().join(',') + ' FROM ' + this.dataSources[0].value;
    this.fusionQuery = query;
    this.fusionParams = { sql: query, key: this.apiKey };
    this.$.datasource.generateRequest();
    this.displayMarkers = [];
    this.markers = [];
  };
  app.toggleSettings = function() {
    this.$.settingsMenu.toggle();
  };
  app.openInfoWindow = function() {
    app.$.infoDialog.open();
  };
  app.googleMapLoaded = function() {
    this.initControls();
  };

  app._getColumnFromSettings = function() {
    var columns = [];
    var baseColumn = 'K' + this.K + '.Chr' + this.chr;
    for (var i = 0; i < this.K; i++) {
      columns.push('\''+baseColumn + '.' + i+'\'');
    }
    return columns;
  };
  app.changeKSetting = function(event) {
    var model = event.model;
    this.K = model.item;
    this.fetchData();
  };
  app._hideChrSetting = function(chrs) {
    return chrs.length === 1;
  };
})(document);
