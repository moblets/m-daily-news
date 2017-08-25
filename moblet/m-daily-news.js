/* eslint no-undef: [0]*/
module.exports = {
  title: "mDailyNews",
  style: "m-daily-news.less",
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
    $mDataLoader,
    $mHeaderAction,
    $mAlert,
    $mWebview,
    $ionicScrollDelegate,
    $location,
    $localStorage,
    $mTheme,
    $sce,
    $q
  ) {
    var helper = {
      error: function(err) {
        console.error(err);
        $scope.moblet.isLoading = false;
        $scope.moblet.noContent = true;
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
      /**
       * Create the tutorial contextual action (icon in header)
       */
      setTutorial: function() {
        if (isDefined($scope.data.tutorial) &&
            $scope.data.tutorial.length > 0) {
          $mHeaderAction.register(
          "mDailyNewsTutorial",
            {
              ios: "ion-ios-help",
              android: "ion-help-circled"
            },
          function() {
            $timeout(function() {
              $scope.showTutorial = !$scope.showTutorial;
              if ($scope.showTutorial) {
                $ionicScrollDelegate.scrollTop(false);
              } else {
                $ionicScrollDelegate.scrollBottom(false);
              }
              $rootScope.$broadcast('scroll.refreshComplete');
            }, 10);
          },
          $stateParams.pageId);
        }
      },
      openLink: function(link) {
        if (typeof cordova === "undefined") {
          $mWebview.open(0, link, "_system", undefined, "", "", "", "", true);
        } else {
          cordova.InAppBrowser.open(link, "_system");
        }
      },
      trustedContent: function(url) {
        var UrlRegEx = /(youtube.com\/embed\/[A-z0-9\-._]*)/;
        var res = url.replace(UrlRegEx, '$1?rel=0&showinfo=0');
        return $sce.trustAsHtml(res);
      }
    };

    var model = {
      loadLocalData() {
        var deferred = $q.defer();

        var data = $mDataLoader.fromLocal($scope.moblet.instance.id);

        deferred.resolve(data);

        return deferred.promise;
      },
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
            if (data.hasOwnProperty('noNews')) {
              deferred.resolve(data);
            } else {
              deferred.reject(new Error('no response from server'));
            }
          })
          .catch(function(err) {
            deferred.reject(err);
          });
        return deferred.promise;
      },

      saveScope: function() {
        $mDataLoader.saveCache(
          $scope.moblet.instance.id,
          $scope.data,
          {
            list: 'news'
          });
      },
      cleanScope: function() {
        var data = {
          noNews: true
        };
        $mDataLoader.saveCache(
          $scope.moblet.instance.id,
          data,
          {
            list: 'news'
          });
      },
      /**
       * Concatenate "data" with the data saved in the local storage
       * @param {Object} data   The data returned from the server
       **/
      setScope: function(data) {
        var saveScope = true;
        // Store remote data on local
        if (!isDefined($scope.data) ||
            !isDefined($scope.data.today) ||
            $scope.data.today !== data.today) {
          // Show welcome message for first visit only
          data.showWelcome = !isDefined($scope.data);
          $scope.data = data;
          if (data.news[0].noNews) {
            saveScope = false;
          } else {
            $scope.data.news[0].highlight.show = true;
          }
        } else {
          $scope.data.showWelcome = false;
          var newRemoteData = data.news.filter(helper.getNewDataFilter);
          // NEW TODO remove news that were removed from server
          if (newRemoteData.length > 0) {
            var lastIndex = $scope.data.news.length - 1;
            if ($scope.data.news[lastIndex].highlight.used) {
              newRemoteData[0].highlight.show = true;
            }
            for (var j = 0; j < newRemoteData.length; j++) {
              $scope.data.news.push(newRemoteData[j]);
            }
          }
        }

        if (saveScope) {
          model.saveScope();
        } else {
          model.cleanScope();
        }
      }
    };

    var controller = {
      /**
       * Create the $scope for the view
       * @param  {Object} data The response from the server
       */
      showView: function() {
        helper.setTutorial();

        // Set error and noContent to false
        $scope.moblet.noContent = false;

        // Remove the loader
        $scope.moblet.isLoading = false;

        $ionicScrollDelegate.scrollBottom(true);

        // Broadcast complete refresh
        $rootScope.$broadcast('scroll.refreshComplete');
      },

      readMore: function(i) {
        $scope.data.news[i].more.used = true;
        model.saveScope();
        helper.scrollTo(i, 0);
      },

      showNext: function(i) {
        $scope.data.news[i].next.used = true;
        $scope.data.news[i + 1].highlight.show = true;
        model.saveScope();
        helper.scrollTo(i + 1);
      }
    };

    /**
     * Initiate the daily news moblet:
     */
    var init = function() {
      // Set general status
      $scope.moblet.isLoading = true;

      // Make the general functions avalable in the scope
      $scope.bgColor = $mTheme.colors.secundary;

      // Put functions in the $scope
      $scope.trustedContent = helper.trustedContent;
      $scope.openLink = helper.openLink;
      $scope.readMore = controller.readMore;
      $scope.showNext = controller.showNext;

      // Pause the video when leaving the view
      $scope.$on('$stateChangeStart', function() {
        $scope.pauseVideo();
      });

      // Load the remote data
      model
        .loadLocalData()
        .then(function(data) {
          console.info('local');
          console.info(data);
          $scope.data = data;
        })
        .then(function() {
          return model.loadRemoteData();
        })
        .then(function(data) {
          console.info('remote');
          console.info(data);
          model.setScope(data);
        })
        .then(function() {
          controller.showView();
        })
        .catch(function(err) {
          helper.error(err);
        });
    };

    init();

    $scope.pauseVideo = function() {
      var iframes = document.getElementsByTagName("iframe");
      for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i].contentWindow;
        iframe.postMessage('{"event":"command","func":"pauseVideo", ' +
        '"args":""}', '*');
      }
    };
  }
};
