/* eslint no-undef: [0]*/
module.exports = {
  title: "mDailyNews",
  style: "m-daily-news.scss",
  template: 'm-daily-news.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $rootScope,
    $filter,
    $timeout,
    $state,
    $stateParams,
    $mMoblet,
    $mDataLoader,
    $ionicScrollDelegate,
    $location
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
     * @param  {boolean} showLoader Boolean to determine if the page loader
     * is active
     * @param {callback} callback Callback function (error, data)
     */
    var loadData = function(showLoader, callback) {
      $scope.isLoading = showLoader;
      var dataLoadOptions = {
        offset: 0,
        items: 100,
        list: 'news',
        cache: false
      };

      // mDataLoader also saves the response in the local cache.
      $mDataLoader.load($scope.moblet, dataLoadOptions)
        .then(function(data) {
          callback(false, data);
        }, function(error) {
          callback(true, error);
        }
      );
    };

    var saveData = function() {
      $mDataLoader.saveCache($scope.moblet.id, $scope.data, {list: 'news'});
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

    /**
     * Set the view and update the needed parameters
     */
    var setView = function() {
      if ($scope.data) {
        $scope.error = false;
        $scope.news = $scope.data.news;
        $ionicScrollDelegate.scrollBottom(true);
        $rootScope.$broadcast('scroll.refreshComplete');
      } else {
        $scope.error = true;
      }
      $scope.isLoading = false;
    };

    /**
      Concatenate "data" with the data saved in the local storage
      @param {object} data The data to be concatenated with @scope.data
    **/
    var concatData = function(data) {
      /**
      Filter function to get data that is not in the local storage
      @param {object} value The news entry to be checked agains the local
      storage news that's already set in $scope.news
      @return {boolean} False if the data exists in the local storage. Only add
      data with new unique ID
      **/
      function getNewData(value) {
        var news = $scope.data.news;
        for (var i = 0; i < news.length; i++) {
          if (news[i].id === value.id) {
            return false;
          }
        }
        return true;
      }

      if (data.news.length > 0) {
        console.log('data news');
        // Set the first element to be shown
        data.news[0].highlight.show = true;
        console.log(data.news[0]);
        if ($scope.data) {
          var newData = data.news.filter(getNewData);
          for (var i = 0; i < newData.length; i++) {
            $scope.data.news.push(newData[i]);
          }
        } else {
          $scope.data = data;
        }
      } else {
        $scope.data = false;
      }
    };
    /**
     * Initiate the daily news moblet:
     */
    var init = function() {
      $scope.moblet = $mMoblet.load();
      // Try to load data from local storage
      $scope.data = $mDataLoader.fromLocal($scope.moblet.id);
      // Get the theme BG color to use in the bubble arrow
      $scope.bgColor = window.getComputedStyle(document.body).backgroundColor;

      // Load data from the API
      loadData(true, function(err, data) {
        if (err) {
          data = [];
        }
        // Concatenate the data loaded from the API with the local storage
        concatData(data);
        saveData();
        console.log($scope.data);
        setView();
      });
    };

    init();

    /**
     * TODO: if not today news, don't show the action buttons
     **/

    $scope.readMore = function(i) {
      $scope.news[i].more.used = true;
      saveData();
      $ionicScrollDelegate.resize();
      $rootScope.$broadcast('scroll.refreshComplete');
      scrollTo(i, 0);
    };

    $scope.showNext = function(i) {
      $scope.news[i].next.used = true;
      $scope.news[i + 1].highlight.show = true;
      saveData();
      $ionicScrollDelegate.resize();
      $rootScope.$broadcast('scroll.refreshComplete');
      scrollTo(i + 1);
    };
  }
};
