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
        $scope.noContent = true;
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
          console.log('resize scroll');
          $ionicScrollDelegate.resize();
        }, 10);

        $timeout(function() {
          console.log('move to anchor', id);
          var top = document.getElementById(id).offsetTop - 10;
          $ionicScrollDelegate.scrollTo(0, top, true);
          $rootScope.$broadcast('scroll.refreshComplete');
        }, 20);
      }
    };

    var appModel = {
      /**
       * Load the instance data from NoRMA and save it in $scope.newData
       * @return {Promise}       Return a promise
       */
      loadInstanceData: function() {
        var deferred = $q.defer();

        var dataLoadOptions = {
          offset: 0,
          items: 100,
          list: 'news',
          cache: false
        };

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            $scope.newData = data;
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
        var localData = $mDataLoader.fromLocal($scope.moblet);

        if (localData === undefined) {
          $scope.data = false;
        } else {
          $scope.data = localData;
        }
      },

      saveData: function() {
        $mDataLoader.saveCache($scope.moblet, $scope.data, {
          list: 'news'
        });
      },

      /**
        Concatenate "data" with the data saved in the local storage
        @return {Boolean}  True if any data was found
      **/
      setScopeData: function() {
        var isData = false;
        // Check if the remote data has news
        if ($scope.newData.news.length > 0) {
          // Set the first element to be shown
          $scope.newData.news[0].highlight.show = true;
          // Check if a local data exists
          if ($scope.data) {
            // Data already set in local storage
            var newData = $scope.newData.news.filter(helpers.getNewDataFilter);
            for (var i = 0; i < newData.length; i++) {
              $scope.data.news.push(newData[i]);
            }
            isData = true;
          } else {
            // No data on local storage
            $scope.data = $scope.newData;
            isData = true;
          }
        // Local data found
        } else if ($scope.data) {
          isData = true;
        // No local data and no news from NoRMA
        } else {
          helpers.error('no data');
          isData = false;
        }
        return isData;
      }
    };

    var newsConstroller = {
      showView: function() {
        // Load the local data
        appModel.loadLocalData();
        var isData = appModel.setScopeData();
        if (isData) {
          // Put functions in the $scope
          $scope.readMore = newsConstroller.readMore;
          $scope.showNext = newsConstroller.showNext;

          // Set error and noContent to false
          $scope.error = false;
          $scope.noContent = false;

          // Remove the loader
          $scope.isLoading = false;

          $ionicScrollDelegate.scrollBottom(true);

          // Broadcast complete refresh
          $rootScope.$broadcast('scroll.refreshComplete');
        } else {
          helpers.error('no data');
        }
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
      appModel.loadInstanceData(false)
        .then(function() {
          // Make the general functions avalable in the scope
          $scope.bgColor = $mAppDef().load().colors.background_color;

          newsConstroller.showView();
        })
        .catch(function(err) {
          helpers.error(err);
        });
    };

    init();

  /**
   * TODO: if not today news, don't show the action buttons
   **/
  }
};
