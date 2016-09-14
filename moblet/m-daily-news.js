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
    $mDataLoader
  ) {
    var dataLoadOptions;
    var news = {
      /**
       * Set the view and update the needed parameters
       * @param  {object} data Data received from Moblets backend
       * @param  {boolean} more If called by "more" function, it will add the
       * data to the items array
       */
      setView: function(data) {
        if (isDefined(data)) {
          $scope.error = false;

          // If it was called from the "more" function, concatenate the items
          $scope.news = data.news;
        } else {
          $scope.error = true;
        }
        // Broadcast complete refresh and infinite scroll
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');

        // Remove the loading animation
        $scope.isLoading = false;
      },

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
       * @param {boolean} cache Use or not the cache to get the news
       */
      load: function(showLoader) {
        // var news = [];
        $scope.isLoading = showLoader || false;
        dataLoadOptions = {
          offset: 0,
          items: 100,
          listKey: 'news',
          cache: true
        };
        // mDataLoader also saves the response in the local cache.
        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            console.log(data);
            news.setView(data);
          }
        );
      },
      /**
       * Load more data from the backend if there are more items.
       * - Update the offset summing the number of items
       - Use $mDataLoader.load to get the moblet data from Moblets backend.
       * 	 The parameters passed to $mDataLoader.load are:
       * 	 - $scope.moblet - the moblet created in the init function
       * 	 - false - A boolean that sets if you want to load data from the
       * 	   device storage or from the Moblets API
       * 	 - dataLoadOptions - An object with parameters for pagination
       */
      more: function() {
        // Add the items to the offset
        dataLoadOptions.offset += dataLoadOptions.items;

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            news.setView(data, true);
          });
      },
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
      init: function() {
        $scope.moblet = $mMoblet.load();
        $scope.load = news.load;
        $scope.load(true);
      }
    };

    $scope.stripHtml = function(str) {
      return str.replace(/<[^>]+>/ig, " ");
    };

    $scope.load = news.load;
    news.init();
  }
};
