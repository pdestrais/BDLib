// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('BDLibApp', ['ionic', 'BDLibApp.controllers', 'BDLibApp.services', 'ngPouch'])

.run(function ($ionicPlatform,ngPouch,$log) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});

	// setupp local db and initialize views
	ngPouch.saveSettings({database:'http://phil:phil@localhost:5984/bdlibdev',stayConnected: true });	
	
	// Creation des view dans DB locale
	var updateView = true;
	if (updateView) { 
		$log.info("Création des vues ...");
	}
	var filterOnGenre = createDesignDoc('filterOnGenre', function(doc) {
															if (doc.type == "genre") {
															  emit(doc._id, doc.genre.nom);
															}
														});
	if (updateView) {
		ngPouch.db.get(filterOnGenre._id)
		.then(function(doc) {
			if (doc._rev) {
				filterOnGenre._rev=doc._rev;
			}
		  return ngPouch.db.put(filterOnGenre);
		}).catch(function (err) {
		  $log.error("filterOnGenre update problem"+JSON.stringify(err));
		});
	}

	var filterOnEditeur = createDesignDoc('filterOnEditeur', function(doc) {
															if (doc.type=="editeur") {
															  emit(doc._id, doc);
															}
														});
	if (updateView) {
		ngPouch.db.get(filterOnEditeur._id)
		.then(function(doc) {
			if (doc._rev) {
				filterOnEditeur._rev=doc._rev;
			}
		  return ngPouch.db.put(filterOnEditeur);
		}).catch(function (err) {
			if (err.message=="missing") {
				ngPouch.db.post(filterOnEditeur)
				.then(function (response) {
					$log.info("filterOnEditeur view created");
				}).catch(function (err) {
					$log.error("filterOnEditeur view create problem"+JSON.stringify(err));
				});
			} else {
				$log.error("filterOnEditeur view update problem"+JSON.stringify(err));
			}
		});
	}

	var filterOnSerie = createDesignDoc('filterOnSerie', function(doc) {
															if (doc.type=="serie") {
															  emit(doc._id, doc);
															}
														});
	if (updateView) {
		ngPouch.db.get(filterOnSerie._id)
		.then(function(doc) {
			if (doc._rev) {
				filterOnSerie._rev=doc._rev;
			}
		  return ngPouch.db.put(filterOnSerie);
		}).catch(function (err) {
			if (err.message=="missing") {
				ngPouch.db.post(filterOnSerie)
				.then(function (response) {
					$log.info("filterOnSerie view created");
				}).catch(function (err) {
					$log.error("filterOnSerie view create problem"+JSON.stringify(err));
				});
			} else {
				$log.error("filterOnSerie view update problem"+JSON.stringify(err));
			}
		});
	}

})

.config(function ($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	.state('app.home', {
		url : '/home',
		views : {
			appContent : {
				templateUrl : 'pages/home.html'
			}
		}
	})

	.state('app', {
		url : '/app',
		abstract : true,
		templateUrl : 'pages/menu.html',
		controller : 'AppCtrl'
	})

	.state('app.albums', {
		url : '/albums',
		views : {
			appContent : {
				templateUrl : 'pages/albums.html'
			}
		}
	})

	.state('app.series', {
		url : '/series',
		views : {
			appContent : {
				templateUrl : 'pages/series.html',
				controller : 'SerieCtrl'
			}
		}
	})

	.state('app.editeurs', {
		url : '/editeurs',
		views : {
			appContent : {
				templateUrl : 'pages/editeurs.html',
				controller : 'EditeurCtrl'
			}
		}
	})

	.state('confirmModal', {
		url : '/confirmModal/:msg',
		templateUrl : 'pages/confirm.html',
		controller : 'ConfirmCtrl'
	})

	.state('errorModal', {
		url : '/errorModal/:msg',
		templateUrl : 'pages/erreur.html',
		controller : 'ConfirmCtrl'
	});

	// if none of the above states are matched, use this as the fallback

	$urlRouterProvider.otherwise('/app/home');

	});