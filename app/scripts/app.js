/* global google */
/* global d3 */
(function (document) {
  'use strict';

  var app = document.querySelector('#app');
  app.showSpinner = true;

  app.apiKey = 'AIzaSyB1GbyVSIOK12RJbFMkaIJjwhVNG-b8fjc';
  app.dataSources = [{value:'1JawTH1dEup1Ie2XRlPFTND2aO9UrbGBLBUgwX1jj',name:'admixture',description:'1001 genomes: admixiture'}];

  app.clusterNames = ['Western Europe','Relicts','Germany','Northern Sweden','Iberian Peninsula','Central Asia','Southern Sweden','Italy, Balkans, Caucasus','Central Europe'];

  app.displayInstalledToast = function () {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!document.querySelector('platinum-sw-cache').disabled) {
      document.querySelector('#caching-complete').show();
    }
  };



  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function () {
    app.$.mapelement.addEventListener('google-map-ready', function() {
          app.initFusionLayer();
      });
  });

  app.populations = [
        {label:'Western Europe (117)',color:'#5781fc'},
        {label:'Relict (25)',color:'#00e03d',isRelic:true},
        {label:'Germany (171)',color:'#55d8d8'},
        {label:'North Sweden (64)',color:'#ff9d00'},
        {label:'Iberian Peninsula (110)',color:'#e04d9d'},
        {label:'Central Asia (79)',color:'#7d55fc'},
        {label:'South Sweden (156)',color:'#fc6355'},
        {label:'Italy, Balkans, Caucasus (92)',color:'white'},
        {label:'Central Europe (184)',color:'#fbf358'}
       ];

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function () {

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
      var customColors = null;
      if (this.K === 9)  {
        customColors = this.populations.map(function(item) { return item.color;});
      }
      marker.position = coordinate;
      marker.colors = customColors;
      marker.data = Kvalues;
      marker.accId = accId;
      marker.name = name;
      markers.push(marker);
    }
    this.showSpinner = false;
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
    this.K = this.K || 9;
    this.chr = this.chrs[0];
    this.fetchData();
  };
  app.initControls = function () {
    var query = 'https://www.googleapis.com/fusiontables/v1/tables/' + this.dataSources[0].value + '/columns?maxResults=0&key=' + this.apiKey;
    this.$.datasourceMeta.url = query;
    this.$.datasourceMeta.generateRequest();
  };
  app.fetchData = function () {
    this.showSpinner = true;
    var query = 'SELECT id,name,longitude,latitude,' + this._getColumnFromSettings().join(',') + ' FROM ' + this.dataSources[0].value;
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
  app.initFusionLayer = function() {
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
    google.maps.event.addListener(layer, 'click', function(e) {
      // Change the content of the InfoWindow
      e.infoWindowHtml = app._getInfoWIndowContent(e.row);
    });
  };

  app._getInfoWIndowContent = function(row) {
    return '<b>id:</b> '+row.id.value + '<br>' +
           '<b>name:</b> '+row.name.value + '<br>' +
           '<b>country:</b> '+row.country.value + '<br>' +
           '<b>sitename:</b> '+row.sitename.value + '<br>' +
           '<b>population:</b> ' + row.population.value +'<br>'
            ;
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
  app._sortPopulations = function(a,b) {
    if (a.isRelic === true) {
      return 1;
    }
    if (b.isRelic === true) {
      return -1;
    }
    return 0;
  };
})(document);
