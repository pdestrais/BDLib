angular.module('BDLibApp.controllers', ['ui.router'])

  .controller('AppCtrl', ['$scope', '$ionicSideMenuDelegate', function ($scope, $ionicSideMenuDelegate) {}

  ])

  .controller('ConfirmCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.msg = $stateParams.msg;
  }
  ])

  .controller('EditeurCtrl', ['CRUDService', '$scope', '$ionicModal', '$state', '$log',
    function (CRUDService, $scope, $ionicModal, $state, $log) {
      // Load the add / change dialog from the given template URL
      $ionicModal.fromTemplateUrl('pages/add-change-editeur-dialog.html', function (modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
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
          scope: $scope,
          animation: 'slide-in-up'
        });
      };

      // Get list from storage
      CRUDService.getList("editeur")
        .then(function (res) {
          // Update UI (almost) instantly
          $scope.list = res;
          $log.info('EditeurCtrl - Editeur list : ' + JSON.stringify($scope.list));
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste d'éditeurs" + err.JSONstringify
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
        CRUDService.addItem(newItem,"editeur")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.list.push(res);
            $scope.leaveAddChangeDialog();
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible de sauvegarder l'éditeur - erreur : " + err.JSONstringify
            });
          });
      // Close dialog
    };

      $scope.removeItem = function (item) {
        // Search & Destroy item from list
        $scope.list.splice($scope.list.indexOf(item), 1);
        // Save list in factory
        CRUDService.deleteItem(item,"editeur");
      };

      $scope.showEditItem = function (item) {
        // Remember edit item to change it later
        $scope.tmpEditItem = item;

        // Preset form values
        //				$scope.form.nom.$setViewValue(item.editeur.nom)
        $scope.nom = item.editeur.nom;
        //				$scope.nom.$setViewValue(item.editeur.nom)
        $scope.id = item._id;
        // Open dialog
        $scope.showAddChangeDialog('change');
      };

      $scope.editItem = function (form) {
        var item = {};
        item.editeur = {};
        item.editeur.nom = form.nom.$modelValue;
        item._id = form.id.$modelValue;

        CRUDService.updateItem(item,"editeur");
        $scope.list[$scope.list.indexOf($scope.tmpEditItem)] = item;

        $scope.leaveAddChangeDialog();
      };
    }
  ])

  .controller('SeriesCtrl', ['CRUDService', '$scope', '$ionicModal', '$state', '$log',
    function (CRUDService, $scope, $ionicModal, $state, $log) {
      // Load the add / change dialog from the given template URL
      $ionicModal.fromTemplateUrl('pages/add-change-serie-dialog.html', function (modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
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
          scope: $scope,
          animation: 'slide-in-up'
        });
      };

      // Get list from storage
      CRUDService.getList("serie")
        .then(function (res) {
          // Update UI (almost) instantly
          $scope.list = res;
          $log.info('SeriesCtrl - Serie list : ' + JSON.stringify($scope.list));
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste de séries " + err.JSONstringify
          });
        });

        CRUDService.getList("genre")
        .then(function (res) {
          // Update UI (almost) instantly
          $scope.genreList = res;
          $log.info('SeriesCtrl - Genre list : ' + JSON.stringify($scope.genreList));
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste de genres " + err.JSONstringify
          });
        });

      // Used to cache the empty form for Edit Dialog
      $scope.saveEmpty = function (form) {
        $scope.id = '';
        $scope.nom = '';
        $scope.genre = '';
      //				$scope.form = angular.copy(form)
    };

      $scope.addItem = function (form) {
        var newItem = {};
        // Add values from form to object
        newItem.nom = form.nom.$modelValue;
        newItem.genre = form.genre.$modelValue;
        CRUDService.addItem(newItem,"serie")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.list.push(res);
            $scope.leaveAddChangeDialog();
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible de sauvegarder l'éditeur - erreur : " + err.JSONstringify
            });
          });
      // Close dialog
    };

      $scope.removeItem = function (item) {
        // Search & Destroy item from list
        $scope.list.splice($scope.list.indexOf(item), 1);
        // Save list in factory
        CRUDService.deleteItem(item,"serie");
      };

      $scope.showEditItem = function (item) {
        // Remember edit item to change it later
        $state.go('app.serie', {
          id: item._id
        });
      };

      $scope.editItem = function (form) {
        var item = {};
        item.serie = {};
        item.serie.nom = form.nom.$modelValue;
        item.serie.genre = form.genre.$modelValue;
        item._id = form.id.$modelValue;

        CRUDService.updateItem(item,"serie");
        $scope.list[$scope.list.indexOf($scope.tmpEditItem)] = item;
        $scope.leaveAddChangeDialog();
      };
    }
  ])

  .controller('SerieCtrl', ['CRUDService', 'GenreService', '$scope', '$ionicModal', '$state', '$log', '$stateParams',
    function (CRUDService, GenreService, $scope, $ionicModal, $state, $log, $stateParams) {

      $scope.id = $stateParams.id;

      if ($scope.id) {
        CRUDService.getList("genre")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.genreList = res;
            $log.info('SerieCtrl - Genre list : ' + JSON.stringify($scope.genreList));

            // Get list from storage - if this part is not done inside the then, this creates very strange effects and options are not correctly filled in
            CRUDService.getItem($scope.id,"serie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.serie = res.serie;
                $log.info('SerieCtrl - Serie : ' + JSON.stringify($scope.serie));
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder aux données de la série" + err.JSONstringify
                });
              });
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible d'accéder à la liste de genres " + err.JSONstringify
            });
          });
      }

      $scope.createAlbum = function() {
        $state.go('app.albums',{
          serieId: $scope.id
        });
      };

    }
  ])

  .controller('AlbumCtrl', ['CRUDService', 'GenreService', '$scope', '$ionicModal', '$state', '$log', '$stateParams',
    function (CRUDService, GenreService, $scope, $ionicModal, $state, $log, $stateParams) {

      $scope.album = {};
      $scope.album.serieId = ($stateParams.serieId) ?  $stateParams.serieId : "";
      $scope.album._id = ($stateParams.albumId) ? $stateParams.albumId : null;

      // si le serieId existe, on souhaite alors créer un nouvel album appartenant à une série. L'albumId est alors null
      if ($scope.serieId) {

      }

      CRUDService.getList("serie")
        .then(function (result) {
          $scope.serieList=result;
          // si l'albumId existe, il faut aller rechercher l'album, le serieId n'a alors pas d'importance
          if ($scope.album._id) {
            CRUDService.getItem($scope.album._id,"album")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.album = res.album;
                $log.info('AlbumCtrl - Album : ' + JSON.stringify($scope.album));
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder aux données de l'album" + err.JSONstringify
                });
              });
          }
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste des séries" + err.JSONstringify
          });
        });

      $scope.addAlbum = function() {
          delete album._id;
          CRUDService.addItem($scope.album,"album");
      };

      $scope.deleteAlbum = function() {
          CRUDService.deleteItem($scope.album._id,"album");
      };

      $scope.updateAlbum = function() {
          CRUDService.updateItem($scope.album._id,"album");
      };

      $scope.createAlbum = function() {
        $state.go('app.albums',{
          serieid: $scope.id
        });
      };

    }
  ])


  // test of nested views
  .controller('mainController', function ($scope) {
    $scope.Model = $scope.Model || {Name : "xxx"};
    $scope.nom = "main";
  })
  ;
