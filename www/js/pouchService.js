'use strict';

angular.module('pouchService', ['ngStorage','pouchdb'])
  .service('pouchService', function($timeout, $localStorage, pouchDB, $log, $rootScope) {

    var service =  {
      // Databases
      db: new PouchDB("LocalDB"),
      remotedb: undefined,

      // Persistent Settings
      settings: {
        database: undefined,
        username: undefined,
        password: undefined,
        stayConnected: undefined
      },

      session: {},

      /*
       *  Initializers
       *
       */

      start: function() {
        // Load Persistent Data
        this.loadSettings();
        this.replicateToFrom(this.settings);
      },

      resetAndSaveSettings: function(settings) {
        var self = this;
        self.cancelReplication();
        self.db.destroy().then( function() {
          $log.info('LocalDB destroyed');
          self.db = new PouchDB("LocalDB");
          $localStorage.pouchStatus = {};
          self.replicateToFrom(settings);
        })
        .catch(function (err) {
          $log.error('local DB not destroyed : '+JSON.stringify(err));
        });
      },

      replicateToFrom: function(settings) {
        var self = this;
        var remoteURL = settings.database;
        if (settings.username || settings.password) {
          remoteURL = settings.database.slice(0,settings.database.indexOf("://")+3)+settings.username+':'+settings.password+'@'+settings.database.slice(settings.database.indexOf("://")+3,settings.database.length);
        }
        self.session.replicationTo = PouchDB.replicate('LocalDB', remoteURL, {
              live: true,
              retry: true
            }).on('change', function (info) {
              // handle change
              $log.info("[replicateTo]change event : "+JSON.stringify(info));
            }).on('paused', function (err) {
              // replication paused (e.g. user went offline)
              $log.info("[replicateTo]paused event : "+JSON.stringify(err));
            }).on('active', function () {
              // replicate resumed (e.g. user went back online)
              $log.info("[replicateTo]active event ");
            }).on('denied', function (info) {
              // a document failed to replicate, e.g. due to permissions
              $log.info("[replicateTo]denied event : "+JSON.stringify(info));
            }).on('complete', function (info) {
              // handle complete
              $log.info("[replicateTo]complete event : "+JSON.stringify(info));
            }).on('error', function (err) {
              // handle error
              $log.info("[replicateTo]error event : "+JSON.stringify(err));
            });
        self.session.replicationFrom = PouchDB.replicate(remoteURL, 'LocalDB', {
              live: true,
              retry: true
            }).on('change', function (info) {
              // handle change
              $log.info("[replicateFrom]change event : "+JSON.stringify(info));
            }).on('paused', function (err) {
              // replication paused (e.g. user went offline)
              $log.info("[replicateFrom]paused event : "+JSON.stringify(err));
              $rootScope.$broadcast('replicationEnded');
            }).on('active', function () {
              // replicate resumed (e.g. user went back online)
              $log.info("[replicateFrom]active event ");
              $rootScope.$broadcast('replicationStarted');
            }).on('denied', function (info) {
              // a document failed to replicate, e.g. due to permissions
              $log.info("[replicateFrom]denied event : "+JSON.stringify(info));
            }).on('complete', function (info) {
              // handle complete
              $log.info("[replicateFrom]complete event : "+JSON.stringify(info));
            }).on('error', function (err) {
              // handle error
              $log.info("[replicateFrom]error event : "+JSON.stringify(err));
            });
            this.settings = settings;
            $localStorage.pouchSettings = settings;
      },

      loadSettings: function() {
        if (typeof $localStorage.pouchSettings !== "undefined") {
          this.settings = $localStorage.pouchSettings;
        }
      },

      getSettings: function() {
        return this.settings;
      },

      // Disconnect from Remote Database
      cancelReplication: function() {
        var self = this;
        if(typeof self.session.replicationTo === "object") {
          console.log("disconnect to");
          self.session.replicationTo.cancel();
        }

        if(typeof self.session.replicationFrom === "object") {
          console.log("disconnect from");
          self.session.replicationFrom.cancel();
        }
      }

    };

    service.start();
    return service
  });
