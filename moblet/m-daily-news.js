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
      console.log('load');
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
     * @param  {object} data Data received from Moblets backend
     * @param  {boolean} more If called by "more" function, it will add the
     * data to the items array
     */
    var setView = function() {
      if ($scope.data) {
        saveData();
        $scope.error = false;
        $scope.news = $scope.data.news;
        $ionicScrollDelegate.scrollBottom();
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');
        $scope.isLoading = false;
      } else {
        $scope.error = true;
      }
    };

    var concatData = function(data) {
      /**
      Filter function to get data that is not in the local storage
      @param {object} value The news entry to be checked agains the local
      storage news that's already set in $scope.news
      @return {boolean} False if the data exists in the local storage
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

      if ($scope.data) {
        var newData = data.news.filter(getNewData);
        for (var i = 0; i < newData.length; i++) {
          /* TODO For each new data, set a param to show them one by one
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
      $scope.data = $mDataLoader.fromLocal($scope.moblet.id);

      // Load data from the API
      loadData(true, function(err, data) {
        if (err) {
          console.log(data);
          concatData([]);
        } else {
          console.log(data);
          concatData(data);
        }
      });
    };

    init();
  }
};
