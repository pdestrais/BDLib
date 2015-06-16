angular.module('BDLibApp.controllers', [])

.controller('AppCtrl', ['$scope', '$ionicSideMenuDelegate', function ($scope, $ionicSideMenuDelegate) {}

	])

.controller('ConfirmCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
			$scope.msg = $stateParams.msg;
		}
	])

.controller('EditeurCtrl', ['EditeurService', '$scope', '$ionicModal', '$state', '$log',
		function (EditeurService, $scope, $ionicModal, $state, $log) {

			// Load the add / change dialog from the given template URL
			$ionicModal.fromTemplateUrl('pages/add-change-editeur-dialog.html', function (modal) {
				$scope.addDialog = modal;
			}, {
				scope : $scope,
				animation : 'slide-in-up'
			});

			$scope.showAddChangeDialog = function (action) {
				$scope.action = action;
				$scope.addDialog.show();
			};

			$scope.leaveAddChangeDialog = function () {
				// Remove dialog
				$scope.addDialog.remove();
				// Reload modal template to have cleared form
				$ionicModal.fromTemplateUrl('pages/add-change-editeur-dialog.html', function (modal) {
					$scope.addDialog = modal;
				}, {
					scope : $scope,
					animation : 'slide-in-up'
				});
			};

			// Get list from storage
			EditeurService.getList()
			.then(function (res) {
				// Update UI (almost) instantly
				$scope.list = res;
				$log.info("EditeurCtrl - Editeur list : " + JSON.stringify($scope.list));
			})
			.catch (function (err) {
				$state.go('errorModal', {
					msg : "Impossible d'accéder à la liste d'éditeurs" + err.JSONstringify
				});
			});

			// Used to cache the empty form for Edit Dialog
			$scope.saveEmpty = function (form) {
				$scope.form = angular.copy(form);
			};

			$scope.addItem = function (form) {
				var newItem = {};
				// Add values from form to object
				newItem.nom = form.nom.$modelValue;
				EditeurService.addItem(newItem)
				.then(function (res) {
						// Update UI (almost) instantly
					$scope.list.push(res);
					$scope.leaveAddChangeDialog();
				})
				.catch (function (err) {
					$state.go('errorModal', {
						msg : "Impossible de sauvegarder l'éditeur - erreur : " + err.JSONstringify
					});
				});
				// Close dialog
			};

			$scope.removeItem = function (item) {
				// Search & Destroy item from list
				$scope.list.splice($scope.list.indexOf(item), 1);
				// Save list in factory
				EditeurService.deleteItem(item);
			};

			$scope.showEditItem = function (item) {

				// Remember edit item to change it later
				$scope.tmpEditItem = item;

				// Preset form values
//				$scope.form.nom.$setViewValue(item.editeur.nom);
				$scope.nom = item.editeur.nom;
//				$scope.nom.$setViewValue(item.editeur.nom);
				$scope.id = item._id;
				// Open dialog
				$scope.showAddChangeDialog('change');
			};

			$scope.editItem = function (form) {

				var item = {};
				item.editeur = {};
				item.editeur.nom = form.nom.$modelValue;
				item._id = form.id.$modelValue;

				EditeurService.updateItem(item);
				$scope.list[$scope.list.indexOf($scope.tmpEditItem)]=item;

				$scope.leaveAddChangeDialog();
			};
		}
	])

.controller('SerieCtrl', ['SerieService','GenreService', '$scope', '$ionicModal', '$state', '$log',
		function (SerieService, GenreService, $scope, $ionicModal, $state, $log) {

			// Load the add / change dialog from the given template URL
			$ionicModal.fromTemplateUrl('pages/add-change-serie-dialog.html', function (modal) {
				$scope.addDialog = modal;
			}, {
				scope : $scope,
				animation : 'slide-in-up'
			});

			$scope.showAddChangeDialog = function (action) {
				$scope.action = action;
				$scope.addDialog.show();
			};

			$scope.leaveAddChangeDialog = function () {
				// Remove dialog
				$scope.addDialog.remove();
				// Reload modal template to have cleared form
				$ionicModal.fromTemplateUrl('pages/add-change-serie-dialog.html', function (modal) {
					$scope.addDialog = modal;
				}, {
					scope : $scope,
					animation : 'slide-in-up'
				});
			};

			// Get list from storage
			SerieService.getList()
			.then(function (res) {
				// Update UI (almost) instantly
				$scope.list = res;
				$log.info("SerieCtrl - Serie list : " + JSON.stringify($scope.list));
			})
			.catch (function (err) {
				$state.go('errorModal', {
					msg : "Impossible d'accéder à la liste de séries " + err.JSONstringify
				});
			});
			
			GenreService.getList()
			.then(function (res) {
				// Update UI (almost) instantly
				$scope.genreList = res;
				$log.info("SerieCtrl - Genre list : " + JSON.stringify($scope.genreList));
			})
			.catch (function (err) {
				$state.go('errorModal', {
					msg : "Impossible d'accéder à la liste de genres " + err.JSONstringify
				});
			});
			

			// Used to cache the empty form for Edit Dialog
			$scope.saveEmpty = function (form) {
				$scope.id = '';
				$scope.nom = '';
				$scope.genre = '';
//				$scope.form = angular.copy(form);
			};

			$scope.addItem = function (form) {
				var newItem = {};
				// Add values from form to object
				newItem.nom = form.nom.$modelValue;
				newItem.genre = form.genre.$modelValue;
				SerieService.addItem(newItem)
				.then(function (res) {
						// Update UI (almost) instantly
					$scope.list.push(res);
					$scope.leaveAddChangeDialog();
				})
				.catch (function (err) {
					$state.go('errorModal', {
						msg : "Impossible de sauvegarder l'éditeur - erreur : " + err.JSONstringify
					});
				});
				// Close dialog
			};

			$scope.removeItem = function (item) {
				// Search & Destroy item from list
				$scope.list.splice($scope.list.indexOf(item), 1);
				// Save list in factory
				SerieService.deleteItem(item);
			};

			$scope.showEditItem = function (item) {

				// Remember edit item to change it later
				$scope.tmpEditItem = item;

				// Preset form values
//				$scope.form.nom.$setViewValue(item.editeur.nom);
				$scope.nom = item.serie.nom;
				$scope.genre = item.serie.genre;
//				$scope.nom.$setViewValue(item.editeur.nom);
				$scope.id = item._id;
				// Open dialog
				$scope.showAddChangeDialog('change');
			};

			$scope.editItem = function (form) {

				var item = {};
				item.serie = {};
				item.serie.nom = form.nom.$modelValue;
				item.serie.genre = form.genre.$modelValue;
				item._id = form.id.$modelValue;

				SerieService.updateItem(item);
				$scope.list[$scope.list.indexOf($scope.tmpEditItem)]=item;

				$scope.leaveAddChangeDialog();
			};
		}
	]);