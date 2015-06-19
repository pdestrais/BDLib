angular.module('BDLibApp.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('GenreService', ['ngPouch', '$q', '$log', function (ngPouch, $q, $log) {

			var cache = cache || [];
			var srv = {
				getList : function () {
					if (cache && cache.length>0) {
						return cache;
					} else {
						var defer = $q.defer();
						ngPouch.db.query('filterOnGenre')
						.then(function (result) {
							$log.debug("GenreService - query result : " + JSON.stringify(result));
							angular.forEach(result.rows, function (value, index) {
								cache.push(value.value);
							});
							defer.resolve(cache);
						}).catch (function (err) {
							$log.error("GenreService - getList error " + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					}
				}
			};
			return srv;
		}
	])
// .factory('EditeurService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {
//
// 			var srv = {
// 				getList : function () {
// 					var defer = $q.defer();
// 					var list = [];
// 					ngPouch.db.query('filterOnEditeur')
// 					.then(function (result) {
// 						$log.debug("EditeurService - query result : " + JSON.stringify(result));
// 						angular.forEach(result.rows, function (value, index) {
// 							list.push(value.value);
// 						});
// 						defer.resolve(list);
// 					}).catch (function (err) {
// 						$log.error("EditeurService - getList error " + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
//
// 				},
// 				addItem : function (item) {
// 					var defer = $q.defer();
// 					var doc = {
// 						"type" : "editeur",
// 						"editeur" : item
// 					};
// 					ngPouch.db.post(doc)
// 					.then(function (response) {
// 						$log.info("EditeurService - Editeur " + JSON.stringify(item) + " ajouté");
// 						doc._id = response.id;
// 						defer.resolve(doc);
// 					}).catch (function (err) {
// 						$log.error("EditeurService - add editeur problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				},
// 				updateItem : function (item) {
// 					var defer = $q.defer();
// 					item.type = "serie";
// 					ngPouch.db.get(item._id)
// 					.then(function (doc) {
// 						item._rev = doc._rev;
// 						ngPouch.db.put(item)
// 						.then(function(resultput) {
// 							$log.info("EditeurService - Editeur " + JSON.stringify(item) + " updaté");
// 							defer.resolve(item);
// 						});
// 					}).catch (function (err) {
// 						$log.error("EditeurService - update serie problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				},
// 				deleteItem : function (item) {
// 					ngPouch.db.get(item._id)
// 					.then(function (doc) {
// 						item._rev = doc._rev;
// 						$log.info("EditeurService - Editeur " + JSON.stringify(item) + " effacé");
// 						return ngPouch.db.remove(item);
// 					}).catch (function (err) {
// 						$log.error("EditeurService - delete serie problem" + JSON.stringify(err));
// 						return (null);
// 					});
// 				}
// 			};
// 			return srv;
// 		}
// 	])
// .factory('SerieService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {
//
// 			var srv = {
// 				getList : function () {
// 					var defer = $q.defer();
// 					var list = [];
// 					ngPouch.db.query('filterOnSerie')
// 					.then(function (result) {
// 						$log.debug("SerieService - query result : " + JSON.stringify(result));
// 						angular.forEach(result.rows, function (value, index) {
// 							list.push(value.value);
// 						});
// 						defer.resolve(list);
// 					}).catch (function (err) {
// 						$log.error("SerieService - getList error " + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
//
// 				},
// 				addItem : function (item) {
// 					var defer = $q.defer();
// 					var doc = {
// 						"type" : "serie",
// 						"serie" : item
// 					};
// 					ngPouch.db.post(doc)
// 					.then(function (response) {
// 						$log.info("SerieService - Editeur " + JSON.stringify(item) + " ajouté");
// 						doc._id = response.id;
// 						defer.resolve(doc);
// 					}).catch (function (err) {
// 						$log.error("SerieService - add serie problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				},
// 				updateItem : function (item) {
// 					var defer = $q.defer();
// 					item.type = "serie";
// 					ngPouch.db.get(item._id)
// 					.then(function (doc) {
// 						item._rev = doc._rev;
// 						ngPouch.db.put(item)
// 						.then(function(resultput) {
// 							$log.info("SerieService - Editeur " + JSON.stringify(item) + " updaté");
// 							defer.resolve(item);
// 						});
// 					}).catch (function (err) {
// 						$log.error("SerieService - update serie problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				},
// 				deleteItem : function (item) {
// 					var defer = $q.defer();
// 					ngPouch.db.get(item._id)
// 					.then(function (doc) {
// 						item._rev = doc._rev;
// 						$log.info("SerieService - Editeur " + JSON.stringify(item) + " effacé");
// 						defer.resolve(ngPouch.db.remove(item));
// 					}).catch (function (err) {
// 						$log.error("SerieService - delete serie problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				},
// 				getItem : function (itemid) {
// 					var defer = $q.defer();
// 					ngPouch.db.get(itemid)
// 					.then(function (doc) {
// 						defer.resolve(doc);
// 					}).catch (function (err) {
// 						$log.error("SerieService - get serie problem" + JSON.stringify(err));
// 						defer.reject(err);
// 					});
// 					return defer.promise;
// 				}
// 			};
// 			return srv;
// 		}
// 	])
//
	.factory('CRUDService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {

				var srv = {
					getList : function (entityType) {
						var defer = $q.defer();
						var list = [];
						viewName = "filterOn"+capitalizeFirstLetter(entityType);
						ngPouch.db.query(viewName)
						.then(function (result) {
							$log.debug("CRUDService - "+ entityType+ " list result : " + JSON.stringify(result));
							angular.forEach(result.rows, function (value, index) {
								list.push(value.value);
							});
							defer.resolve(list);
						}).catch (function (err) {
							$log.error("CRUDService - getList error " + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;

					},
					addItem : function (item,entityType) {
						var defer = $q.defer();
						var doc = {
							"type" : entityType.toLowerCase(),
							"serie" : item
						};
						ngPouch.db.post(doc)
						.then(function (response) {
							$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(item) + " ajouté");
							doc._id = response.id;
							defer.resolve(doc);
						}).catch (function (err) {
							$log.error("CRUDService - add "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					updateItem : function (item,entityType) {
						var defer = $q.defer();
						item.type = entityType.toLowerCase();
						ngPouch.db.get(item._id)
						.then(function (doc) {
							item._rev = doc._rev;
							ngPouch.db.put(item)
							.then(function(resultput) {
								$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(item) + " updaté");
								defer.resolve(item);
							});
						}).catch (function (err) {
							$log.error("CRUDService - update "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					deleteItem : function (item,entityType) {
						var defer = $q.defer();
						ngPouch.db.get(item._id)
						.then(function (doc) {
							item._rev = doc._rev;
							$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(item) + " effacé");
							defer.resolve(ngPouch.db.remove(item));
						}).catch (function (err) {
							$log.error("CRUDService - delete "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					getItem : function (itemid,entityType) {
						var defer = $q.defer();
						ngPouch.db.get(itemid)
						.then(function (doc) {
							defer.resolve(doc);
						}).catch (function (err) {
							$log.error("CRUDService - delete "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					}
				};
				return srv;
			}
		])
	;
