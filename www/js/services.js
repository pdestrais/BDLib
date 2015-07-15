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

	.factory('CRUDService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {

				var srv = {
					getList : function (entityType,viewName,options) {
						var defer = $q.defer();
						var list = [];
						//	viewName = "filterOn"+capitalizeFirstLetter(entityType);
						ngPouch.db.query(viewName,options)
						.then(function (result) {
							$log.debug("CRUDService - "+ entityType+ " list result : " + JSON.stringify(result));
							angular.forEach(result.rows, function (value, index) {
								item = value.value;
								item._id = value.id;
								list.push(item);
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
						var type = entityType.toLowerCase();
						var doc = {
							"type" : type
						};
						doc[type]=item;
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
					updateItem : function (id,rev,item,entityType) {
						var defer = $q.defer();
						if (!id)
							defer.reject("pas d'identifiant pour update");
						var type = entityType.toLowerCase();
						doc={"_id":id,"_rev":rev,"type":type};
						doc[type]=item;
						if (!rev)
						{
							ngPouch.db.get(doc._id)
							.then(function (resdoc) {
									doc._rev = resdoc._rev;
								}).catch (function (err) {
									$log.error("CRUDService - update "+ entityType + " problem" + JSON.stringify(err));
									defer.reject(err);
								});
						}
						ngPouch.db.put(doc)
						.then(function(resultput) {
								$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(resultput) + " updaté");
								defer.resolve(resultput);
							}).catch (function (err) {
								$log.error("CRUDService - update "+ entityType + " problem" + JSON.stringify(err));
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

	.factory('ViewsService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {

			var srv = {
				create : function () {
						// Creation des view dans DB locale
						var updateView = false;
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

						var listAlbumsBySerieId = createDesignDoc('listAlbumsBySerieId', function(doc) {
																				if (doc.type=="album") {
																					emit([doc.album.serieId,doc.album.numero], doc.album);
																				}
																			});
						if (updateView) {
							ngPouch.db.get(listAlbumsBySerieId._id)
							.then(function(doc) {
								if (doc._rev) {
									listAlbumsBySerieId._rev=doc._rev;
								}
								return ngPouch.db.put(listAlbumsBySerieId);
							}).catch(function (err) {
								if (err.message=="missing") {
									ngPouch.db.post(listAlbumsBySerieId)
									.then(function (response) {
										$log.info("listAlbumsBySerieId view created");
									}).catch(function (err) {
										$log.error("listAlbumsBySerieId view create problem"+JSON.stringify(err));
									});
								} else {
									$log.error("listAlbumsBySerieId view update problem"+JSON.stringify(err));
								}
							});
						}
				}
			};
			return srv;
		}
	])


	;
