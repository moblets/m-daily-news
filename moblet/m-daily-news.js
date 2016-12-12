/* eslint no-undef: [0]*/
module.exports = {
  title: "mDailyNews",
  style: "m-daily-news.less",
  template: 'm-daily-news.html',
  i18n: {
    pt: "lang/pt-BR.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $rootScope,
    $filter,
    $timeout,
    $state,
    $stateParams,
    $mDataLoader,
    $mContextualActions,
    $mAlert,
    $ionicScrollDelegate,
    $location,
    $localStorage,
    $mAppDef,
    $q
  ) {
    var helpers = {
      error: function(err) {
        console.error(err);
        $scope.isLoading = false;
        $scope.error = true;
      },
      /**
      Filter function to get data that is not in the local storage
      @param {object} value The news entry to be checked agains the local
      storage news that's already set in $scope.data.news
      @return {boolean} False if the data exists in the local storage. Only add
      data with new unique ID
      **/
      getNewDataFilter: function getNewDataFilter(value) {
        for (var i = 0; i < $scope.data.news.length; i++) {
          if ($scope.data.news[i].id === value.id) {
            return false;
          }
        }
        return true;
      },
      scrollTo: function(id, subId) {
        id = subId === undefined ? id : id + '-' + subId;
        id = 'anchor-' + id;

        $ionicScrollDelegate.resize();
        $rootScope.$broadcast('scroll.refreshComplete');

        $timeout(function() {
          $ionicScrollDelegate.resize();
        }, 10);

        $timeout(function() {
          var top = document.getElementById(id).offsetTop - 10;
          $ionicScrollDelegate.scrollTo(0, top, true);
          $rootScope.$broadcast('scroll.refreshComplete');
        }, 20);
      },
      cleanScreen: function() {
        for (var i = 0; i < $scope.data.news.length; i++) {
          if ($scope.data.news[i].highlight) {
            $scope.data.news[i].highlight.used = true;
            $scope.data.news[i].highlight.show = false;
          }
        }
        $mDataLoader.saveCache($scope.moblet.instance.id, $scope.data, {
          list: 'news'
        });
        console.log($scope.data);
      },
      /**
       * Create the clean screen contextual action (icon in header)
       */
      setClearContextualAction: function() {
        var icons = ["ion-ios-trash", "ion-trash-b"];
        $mContextualActions.add(
          $scope.page.page_id,
          "cart",
          icons,
          "contextual",
          function() {
            $mAlert
              .dialog(
                "Limpar histórico?",
                'Você tem certeza que deseja limpar o histórico? Esta ação' +
                'não pode ser desfeita',
                ['Cancelar', 'Limpar']
            )
              .then(function() {
                helpers.cleanScreen();
              });
          }
        );
      }
    };

    var appModel = {
      /**
       * Load the instance data from NoRMA and save it in $scope.remoteData
       * @return {Promise}       Return a promise
       */
      loadRemoteData: function() {
        var deferred = $q.defer();

        var dataLoadOptions = {
          offset: 0,
          items: 100,
          list: 'news',
          cache: false
        };

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            $scope.remoteData = data;
            deferred.resolve();
          })
          .catch(function(err) {
            helpers.error(err);
            deferred.reject(err);
          });
        return deferred.promise;
      },

      /**
       * Load the localStorage saved data and saves it in $scope.data
       */
      loadLocalData: function() {
        $scope.data = $mDataLoader.fromLocal($scope.moblet.instance.id);
      },

      saveData: function() {
        $mDataLoader.saveCache($scope.moblet.instance.id, $scope.data, {
          list: 'news'
        });
      },

      addNoNews: function() {
        console.log('adding "no news" to stream');
        console.log($scope.data);
        var noNews = {
          date: $scope.data.today,
          highlight: {
            content: $scope.data.noNews,
            show: true,
            used: true,
            noNews: true
          }
        };
        var lastIndex = $scope.data.news.length === 0 ?
          0 :
          $scope.data.news.length - 1;

        // No news
        if ($scope.data.news[lastIndex] === undefined) {
          $scope.data.news.push(noNews);
        // Check if noNews has already been set
        } else if ($scope.data.news[lastIndex].highlight.noNews === undefined) {
          $scope.data.news[lastIndex].highlight.used = true;
          $scope.data.news[lastIndex].next.used = true;
          $scope.data.news[lastIndex].next.hide = true;
          $scope.data.news.push(noNews);
        }
        appModel.saveData();
      },
      /**
       * Concatenate "data" with the data saved in the local storage
       **/
      setScopeData: function() {
        console.log($scope.data);
        console.log($scope.remoteData);
        // Check if no local data exists
        if ($scope.data === undefined) {
          $scope.data = $scope.remoteData;

          if ($scope.data.news.length === 0) {
            appModel.addNoNews();
          } else {
            $scope.data.news[0].highlight.show = true;
          }
          appModel.saveData();
        // Local data exists. Update $scope.data
        } else {
          $scope.data.noNews = $scope.remoteData.noNews;
          $scope.data.today = $scope.remoteData.today;

          // Check if there are news today
          if ($scope.remoteData.news.length > 0) {
            // Get only new remote data
            var newRemoteData = $scope.remoteData.news
              .filter(helpers.getNewDataFilter);

            // check if any news today are really new
            if (newRemoteData.length === 0) {
              appModel.addNoNews();
            } else {
              // If the last news is a "noNews", load the next news and "click"
              // the "show next"
              var lastNews = $scope.data.news[$scope.data.news.length - 1];
              if (lastNews.highlight.noNews) {
                console.log($scope.data.news);
                console.log($$scope.data.news[$scope.data.news.length - 2]);
              // $scope.data.news[$scope.data.news.length - 2].
              }
              // Set the first new element to be shown
              newRemoteData[0].highlight.show = true;
              for (var i = 0; i < newRemoteData.length; i++) {
                $scope.data.news.push(newRemoteData[i]);
              }
              appModel.saveData();
            }
          } else {
            appModel.addNoNews();
          }
        }
      }
    };

    var newsConstroller = {
      showView: function() {
        appModel.setScopeData();
        // Put functions in the $scope
        $scope.readMore = newsConstroller.readMore;
        $scope.showNext = newsConstroller.showNext;

        // Set error and noContent to false
        $scope.error = false;

        // Remove the loader
        $scope.isLoading = false;

        $ionicScrollDelegate.scrollBottom(true);

        // Broadcast complete refresh
        $rootScope.$broadcast('scroll.refreshComplete');
      },

      readMore: function(i) {
        $scope.data.news[i].more.used = true;
        appModel.saveData();
        helpers.scrollTo(i, 0);
      },

      showNext: function(i) {
        $scope.data.news[i].next.used = true;
        $scope.data.news[i + 1].highlight.show = true;
        appModel.saveData();
        helpers.scrollTo(i + 1);
      }
    };

    /**
     * Initiate the daily news moblet:
     */
    var init = function() {
      // Set general status
      $scope.isLoading = true;
      // Make the general functions avalable in the scope
      $scope.bgColor = $mAppDef().load().colors.background_color;
      // Add the trash to the header
      helpers.setClearContextualAction();
      // Load the local data
      appModel.loadLocalData();
      // Load the remote data
      appModel.loadRemoteData(false)
        .then(function() {
          newsConstroller.showView();
        })
        .catch(function(err) {
          helpers.error(err);
        });
    };

    init();
  }
};
