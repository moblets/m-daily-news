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
    $ionicScrollDelegate
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

    /**
     * Set the view and update the needed parameters
     */
    var setView = function() {
      if ($scope.data) {
        saveData();
        $scope.error = false;
        /*
         * TODO: Show each news at a time
         */
        $scope.news = $scope.data.news;

        $ionicScrollDelegate.scrollBottom();
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');
        $scope.isLoading = false;
      } else {
        $scope.error = true;
      }
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

      // Set the first element to be shown
      data[0].highlight.show = true;

      if ($scope.data) {
        var newData = data.news.filter(getNewData);
        for (var i = 0; i < newData.length; i++) {
          $scope.data.news.push(newData[i]);
        }
      } else {
        $scope.data = data;
      }
      setView();
    };
    /**
     * Initiate the list moblet:
     * - Get data from local storage to show old news
     * - Create a moblet with $mMoblet.load()
     * - put the list.load function in the $scope
     * - run list.load function
     */
    /*
     * TODO go to detail if url is called
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
      });
    };

    init();
  }
};
