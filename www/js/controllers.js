angular.module('BDLibApp.controllers', ['ui.router'])

  .controller('AppCtrl', ['ViewsService','$cacheFactory','ngPouch','$state','$scope', '$ionicSideMenuDelegate', function (ViewsService,$cacheFactory,ngPouch,$state,$scope, $ionicSideMenuDelegate) {

    // setup local db and initialize views
  	var cache = $cacheFactory('prefsCache');

    ngPouch.db.get("serverUrl")
    .then(function(doc) {
      cache.put("serverUrl",doc.serverUrl);
      ViewsService.create();
    }).catch(function (err) {
      if (err.message=="missing") {
        // Si l'application n'a pas déjà été initialisée
        // renvoyer vers la page de préférences
        $state.go('app.preferences',{
          init: 0
        });
      }
    });
  }
  ])

  .controller('PreferenceCtrl', ['$cacheFactory','ngPouch','$scope', '$log', function ($cacheFactory,ngPouch,$scope, $log) {

    var cache = $cacheFactory.get('prefsCache');

    if (!cache.get("serverUrl")) {
      // si serverUrl n'est pas initialisé, créer une valeur par défault
      $scope.url = "http://localhost:5984/bdlibdev";
      $scope.firstInit = true;
      } else {
        // sinon aller chercher la valeur sauvegardée précédemment
        ngPouch.db.get("serverUrl")
        .then(function(doc) {
          $scope.url = doc.url;
        });
      }
      // creation de serverUrl pour la première initialisation
      $scope.setRemoteUrl =function () {
        var serverUrlDoc = {_id : "serverUrl", url : $scope.url};
        ngPouch.db.put(serverUrlDoc);
        cache.put("serverUrl",true);
      };

      $scope.updateRemoteUrl = function () {
        var serverUrlDoc = {_id : "serverUrl", url : $scope.url};
        ngPouch.db.get("serverUrl")
        .then(function(doc) {
          // verifier que l'URL précédente est différente et si c'est le cas, detruire la base de donnée locale et re-initialiser la synchronization avec la nouvelle base distante
          if (doc.url != $scope.url) {
            if (doc._rev) {
              serverUrlDoc._rev=doc._rev;
              ngPouch.db.put(serverUrlDoc)
              .then(function(doc) {
                cache.put("serverUrl",true);
                ngPouch.saveSettings({database:$scope.url,stayConnected: true });
                ngPouch.reset();
              })
              .catch(function (err) {
                $log.error("serverUrl pref create problem"+JSON.stringify(err));
              });
            } else {
              $log.error("serverUrl pref create problem"+JSON.stringify(err));
            }
          }
        }).catch(function (err) {
          if (err.message=="missing") {
            ngPouch.db.post(serverUrlDoc)
            .then(function (response) {
              ngPouch.saveSettings({database:$scope.url,stayConnected: true });
              ngPouch.reset();
              $log.info("serverUrl pref created");
            }).catch(function (err) {
              $log.error("serverUrl pref create problem"+JSON.stringify(err));
            });
          } else {
            $log.error("serverUrl pref update problem"+JSON.stringify(err));
          }
        });
//        ngPouch.saveSettings({database:'http://localhost:5984/bdlibdev',stayConnected: true });
      };

    }
  ])

  .controller('ConfirmCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.msg = $stateParams.msg;
    $scope.returnState=$stateParams.state;
    $scope.id=$stateParams.id;
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
      CRUDService.getList("editeur","filterOnEditeur")
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
      CRUDService.getList("serie","filterOnSerie")
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

        CRUDService.getList("genre","filterOnGenre")
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
        // TODO - supprimer tous les albums de la série
      };

      $scope.showEditItem = function (item) {
        // Remember edit item to change it later
        $state.go('app.serie', {
          serieId: item._id
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

  .controller('SerieCtrl', ['CRUDService', 'GenreService', '$scope', '$ionicModal', '$ionicPopup', '$state', '$log', '$stateParams',
    function (CRUDService, GenreService, $scope, $ionicModal, $ionicPopup, $state, $log, $stateParams) {

      $scope.id = $stateParams.serieId;
      $scope.serie = $scope.serie || {};
      $scope.album = $scope.album || {};
      $scope.serieId = ($stateParams.serieId) ?  $stateParams.serieId : "";
      $scope.album.numero = ($stateParams.albumNr) ? $stateParams.albumNr : null;
      $log.info('SerieCtrl - serie id parameter : ' + $scope.serieId);

      if ($scope.serieId) {
        CRUDService.getList("genre","filterOnGenre")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.genreList = res;
            $log.info('SerieCtrl - Genre list : ' + JSON.stringify($scope.genreList));
            // Get list from storage - if this part is not done inside the then, this creates very strange effects and options are not correctly filled in
            CRUDService.getItem($scope.serieId,"serie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.serie = res.serie;
                $scope.serieRev = res._rev;
                $scope.albums = res.serie.albums;
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

      // $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      //   $log.info('SerieCtrl - stateChangeSuccess event');
      //   switch (fromState.name) {
      //     case 'app.series' :
      //     case 'app.serie.album' :
      //       if ($scope.serieId) {
      //         CRUDService.getList("genre","filterOnGenre")
      //           .then(function (res) {
      //             // Update UI (almost) instantly
      //             $scope.genreList = res;
      //             $log.info('SerieCtrl - Genre list : ' + JSON.stringify($scope.genreList));
      //             // Get list from storage - if this part is not done inside the then, this creates very strange effects and options are not correctly filled in
      //             CRUDService.getItem($scope.serieId,"serie")
      //               .then(function (res) {
      //                 // Update UI (almost) instantly
      //                 $scope.serie = res.serie;
      //                 $scope.serieRev = res._rev;
      //                 $scope.albums = res.serie.albums;
      //                 $log.info('SerieCtrl - Serie : ' + JSON.stringify($scope.serie));
      //               })
      //               .catch(function (err) {
      //                 $state.go('errorModal', {
      //                   msg: "Impossible d'accéder aux données de la série" + err.JSONstringify
      //                 });
      //               });
      //           })
      //           .catch(function (err) {
      //             $state.go('errorModal', {
      //               msg: "Impossible d'accéder à la liste de genres " + err.JSONstringify
      //             });
      //           });
      //       }
      //       break;
      //     case 'app.serie' :
      //       // Aller rechercher la liste des séries pour pouvoir associer l'album à une série ou updater la série à laquelle appartient l'album
      //       CRUDService.getList("serie","filterOnSerie")
      //         .then(function (result) {
      //           $scope.serieList=result;
      //           // si l'albumId existe, il faut aller rechercher l'album, le serieId n'a alors pas d'importance
      //           if ($stateParams.albumNr) {
      //             for (var i=0; i < $scope.albums.length; i++) {
      //               if (res.album.numero == $stateParams.albumNr) {
      //                 $scope.album = res.album[i];
      //                 break;
      //               }
      //             }
      //           }
      //         })
      //         .catch(function (err) {
      //           $state.go('errorModal', {
      //             msg: "Impossible d'accéder à la liste des séries" + err.JSONstringify
      //           });
      //         });
      //   }
      // });

      $scope.createAlbum = function() {
        $state.go('app.serie.album',{
          "serieId": $scope.id,
          "albumNr": ""
        });
      };

      $scope.deleteAlbum = function(album) {
        for (var i=0; i < $scope.serie.albums.length; i++) {
          if ($scope.serie.albums[i].numero == album.numero) {
            $scope.serie.albums.splice(i,1);
            // delete $scope.serie.albums[i];
            // // la longueur de l'array ne semble pas se mettre à jour automatiquement ???
            // $scope.serie.albums.length--;
            break;
          }
        }
        CRUDService.updateItem($scope.serieId,$scope.serieRev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.editAlbum = function(album) {
          $state.go('app.serie.album', {
            serieId : $scope.id,
            albumNr : album.numero
          });
      };

    }
  ])

  .controller('AlbumCtrl', ['CRUDService', 'GenreService', '$scope', '$ionicModal', '$ionicPopup', '$state', '$log', '$stateParams',
    function (CRUDService, GenreService, $scope, $ionicModal, $ionicPopup, $state, $log, $stateParams) {

      $scope.album = {};
      $scope.serieId = ($stateParams.serieId) ?  $stateParams.serieId : "";
      $scope.albumNr = ($stateParams.albumNr) ? $stateParams.albumNr : null;
      $log.info('AlbumCtrl - serieId / albumNr : ' + $scope.serieId + " / "+$scope.albumNr);

      if ($scope.serieId) {
        // Charger la série identifiée par son serieId
        CRUDService.getItem($scope.serieId,"serie")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.serie = res.serie;
            $scope._id=res._id;
            $scope._rev=res._rev;
            $log.info('AlbumCtrl - serie : ' + JSON.stringify($scope.serie));

            // si serieId et albumNr existent, on vient du state 'serie' et on a sélectionné un album pour modification
            if($scope.albumNr) {
              // charger l'album sélectionner dans le scope
              if ($scope.albumNr && $scope.serie.albums) {
                for (var i=0; i < $scope.serie.albums.length; i++) {
                  if ($scope.serie.albums[i].numero == $scope.albumNr) {
                    $scope.album = res.serie.albums[i];
                    $scope.oldAlbumNr = $scope.serie.albums[i].numero;
                    break;
                  }
                }
              }
            }
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible d'accéder aux données de l'album" + err.JSONstringify
            });
          });
        }
        // else {
        //   // si serieId existe et albumNr n'existe pas, on vient du state 'serie' et on veut créer un nouvel album
        //   // rien à faire
        // }

      // si serieId et albumNr n'existent pas, on vient du menu album pour créer un nouvel album
      if (!$scope.serieId) {
        // Charger la liste des séries dans le scope
        CRUDService.getList("serie","filterOnSerie")
          .then(function (result) {
            $scope.serieList=result;
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible d'accéder à la liste des séries" + err.JSONstringify
            });
          });
        }

      $scope.addAlbum = function() {
          var duplicate = false;
          if (!$scope.serieId) {
            // fetch serie based on serieId
            CRUDService.getItem($scope.album.serieId,"serie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.serie = res.serie;
                $scope._id=res._id;
                $scope.serieId=res._id;                
                $scope._rev=res._rev;
                // Contrôler qu'il n'a a pas déjà un album portant le même numéro
                if ($scope.serie.albums) {
                  for (var i=0; i < $scope.serie.albums.length; i++) {
                    if ($scope.serie.albums[i].numero == $scope.album.numero) {
                      // album avec le même numéro trouvé => doublon => générer message d'erreur
                      duplicate=true;
                    }
                  }
                } else {
                  $scope.serie.albums = [];
                }

                if (!duplicate) {
                  delete $scope.album.serieId;
                  $scope.serie.albums.push($scope.album);
                  CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
                  .then(function(res) {
                    if ($scope.comingFromSerie) {
                        $log.info('AlbumCtrl - going back to serie screen');
                        $state.go('app.serie', {
                          "serieId" : $scope.serieId
                        },{reload:true});
                        // $log.info('AlbumCtrl - reloading app.serie state');
                        // $state.reload('app.serie');
                    } else {
                      // go back home in case album is created without coming from the Serie screen
                      var alertPopup = $ionicPopup.alert({
                        title: 'Confirmation',
                        template: 'Album créé'
                      });
                      alertPopup.then(function(res) {
                        $state.go('app.serie', {
                          serieId: $scope.serieId
                        });
                      });
                    }
                  });
                } else {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Erreur',
                    template: "<style>.popup-head { background-color : red; }</style>Le numéro de l'album existe déjà"
                  });
                  alertPopup.then(function(res) {
                  });
                }
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder aux données de l'album" + err.JSONstringify
                });
              });
          }

          // Contrôler qu'il n'a a pas déjà un album portant le même numéro
          if ($scope.serie.albums) {
            for (var i=0; i < $scope.serie.albums.length; i++) {
              if ($scope.serie.albums[i].numero == $scope.album.numero) {
                // album avec le même numéro trouvé => doublon => générer message d'erreur
                duplicate=true;
                $state.go('errorModal', {
                  msg: "Le numéro de l'album existe déjà"
                });
              }
            }
          } else {
            $scope.serie.albums = [];
          }

          if (!duplicate) {
            delete $scope.album.serieId;
            $scope.serie.albums.push($scope.album);
            CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
            .then(function(res) {
              if ($scope.comingFromSerie) {
                  $log.info('AlbumCtrl - going back to serie screen');
                  $state.go('app.serie', {
                    "serieId" : $scope.serieId
                  },{reload:true});
                  // $log.info('AlbumCtrl - reloading app.serie state');
                  // $state.reload('app.serie');
              } else {
                // go back home in case album is created without coming from the Serie screen
                var alertPopup = $ionicPopup.alert({
                  title: 'Confirmation',
                  template: 'Album créé'
                });
                alertPopup.then(function(res) {
                  $state.go('app.serie', {
                    serieId: $scope.serieId
                  });
                });
              }
            });
          }  else {
            var alertPopup = $ionicPopup.alert({
              title: 'Erreur',
              template: "<style>.popup-head { background-color : red; }</style>Le numéro de l'album existe déjà"
            });
            alertPopup.then(function(res) {
            });
          }
      };

      $scope.deleteAlbum = function() {
        for (var i=0; i < $scope.serie.albums.length; i++) {
          if ($scope.serie.albums[i].numero == $scope.album.numero) {
            delete $scope.serie.albums[i];
            break;
          }
        }
        CRUDService.deleteItem($scope.serieId,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.updateAlbum = function() {
        // Si l'ancien numéro est différent, contrôler qu'il n'y pas de doublon
        if ($scope.oldAlbumNr != $scope.albumNr) {
          // Contrôler qu'il n'a a pas déjà un album portant le même numéro
          for (var i=0; i < $scope.serie.albums.length; i++) {
            if ($scope.serie.albums[i].numero == $scope.album.numero) {
              // album avec le même numéro trouvé => doublon => générer message d'erreur
              $state.go('errorModal', {
                msg: "Le numéro de l'album existe déjà"
              });
            }
          }
        }
        CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.createAlbum = function() {
        $state.go('app.albums',{
          serieid: $scope.id
        });
      };

    }
  ])

  .controller('BiblioCtrl', function ($scope) {
    $scope.Model = $scope.Model || {Name : "xxx"};
  })


  // test of nested views
  .controller('mainController', function ($scope) {
    $scope.Model = $scope.Model || {Name : "xxx"};
    $scope.nom = "main";
  })
  ;
