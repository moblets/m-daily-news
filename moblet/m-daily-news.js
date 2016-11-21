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
    $mAppDef
  ) {
    /**
     * Load data from the Moblets backend:
     * - show the page loader if it's called by init (sets showLoader to true)
     * - Use $mDataLoader.load to get the moblet data from Moblets backend.
     * 	 The parameters passed to $mDataLoader.load are:
     * 	 - $scope.moblet - the moblet created in the init function
     * 	 - false - A boolean that sets if you want to load data from the
     * 	   device storage or from the Moblets API
     * 	 - dataLoadOptions - An object with parameters for pagination
     * @param {callback} callback Callback function (error, data)
     */
    var loadInstanceData = function(callback) {
      var dataLoadOptions = {
        offset: 0,
        items: 100,
        list: 'news',
        cache: false
      };

      // mDataLoader also saves the response in the local cache.
      $mDataLoader.load($scope.moblet, dataLoadOptions)
        .then(
          function(data) {
            callback(data);
          },
          function(error) {
            console.error(error);
            callback([]);
          }
      );
    };

    var saveData = function() {
      $mDataLoader.saveCache($scope.moblet, $scope.data, {
        list: 'news'
      });
    };

    var scrollTo = function(id, subId) {
      id = subId === undefined ? id : id + '-' + subId;
      id = 'anchor-' + id;

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
    };

    // var getCurrentGreeting = function() {
    //   var type = '';
    //   var curentTime = new Date();
    //   var time = curentTime.getHours() * 100 + curentTime.getMinutes();
    //
    //   if (time >= 401 && time <= 1200) {
    //     type = 'morning';
    //   } else if (time >= 1201 && time <= 2000) {
    //     type = 'afternoon';
    //   } else {
    //     type = 'evening';
    //   }
    //
    //   return type;
    // };

    /**
     * Set the view and update the needed parameters
     */
    var setView = function() {
      if ($scope.data) {
        // $scope.data.greeting = getCurrentGreeting();
        // console.log($scope.data);
        // Get the theme BG color to use in the bubble arrow
        $scope.bgColor = $mAppDef().load().colors.background_color;
        $scope.error = false;
        $ionicScrollDelegate.scrollBottom(true);
        $rootScope.$broadcast('scroll.refreshComplete');
      } else {
        $scope.error = true;
      }
      $scope.isLoading = false;
    };

    /**
      Concatenate "data" with the data saved in the local storage
      @param {object} data The data to be concatenated with $scope.data
    **/
    var setScopeData = function(data) {
      if (data.news.length > 0) {
        // Set the first element to be shown
        data.news[0].highlight.show = true;
        // Check if a local data exists
        if ($scope.data === undefined) {
          // No data on local storage
          $scope.data = data;
        } else {
          // Data already set in local storage
          var newData = data.news.filter(getNewDataFilter);
          for (var i = 0; i < newData.length; i++) {
            $scope.data.news.push(newData[i]);
          }
        }
      } else {
        $scope.data = false;
      }
    };

    /**
     * Initiate the daily news moblet:
     */
    var init = function() {
      console.log('init');
      $scope.isLoading = true;
      // Try to load data from local storage
      $scope.data = $mDataLoader.fromLocal($scope.moblet);
      // Load data from the API
      loadInstanceData(function(remoteData) {
        // Concatenate the remoteData loaded from the API with the local storage set in $scope
        setScopeData(remoteData);
        saveData();
        setView();
      });
    };

    init();

    /**
     * TODO: if not today news, don't show the action buttons
     **/

    /**
    Filter function to get data that is not in the local storage
    @param {object} value The news entry to be checked agains the local
    storage news that's already set in $scope.data.news
    @return {boolean} False if the data exists in the local storage. Only add
    data with new unique ID
    **/
    getNewDataFilter = function getNewDataFilter(value) {
      for (var i = 0; i < $scope.data.news.length; i++) {
        if ($scope.data.news[i].id === value.id) {
          return false;
        }
      }
      return true;
    };

    $scope.readMore = function(i) {
      $scope.data.news[i].more.used = true;
      saveData();
      $ionicScrollDelegate.resize();
      $rootScope.$broadcast('scroll.refreshComplete');
      scrollTo(i, 0);
    };

    $scope.showNext = function(i) {
      $scope.data.news[i].next.used = true;
      $scope.data.news[i + 1].highlight.show = true;
      saveData();
      $ionicScrollDelegate.resize();
      $rootScope.$broadcast('scroll.refreshComplete');
      scrollTo(i + 1);
    };
  }
};
