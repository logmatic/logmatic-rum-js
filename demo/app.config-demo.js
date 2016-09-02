'use strict';

angular.module('phonecatApp')
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.when('/phones', {
        template: '<phone-list></phone-list>'
      }).when('/phones/:phoneId', {
        template: '<phone-detail></phone-detail>'
      }).otherwise('/phones');
    }
  ])

  // This block enable RUM for angular
  .run(['$rootScope', function ($rootScope) {
      // If boomerang is loaded to late to watch the first route change happen
      // toggle hadRouteChange to true using the routeChangeStart callback.
      // This will tell the plugin to fire a beacon immediately as it gets
      // initialized and not wait for a routeChange event.
      var hadRouteChange = false;
      $rootScope.$on("$routeChangeStart", function () {
        hadRouteChange = true;
      });
      function hookAngularBoomerang() {

        if (window.BOOMR && BOOMR.version) {
          if (BOOMR.plugins && BOOMR.plugins.Angular) {
            // pass your $rootScope object and the aforementioned hadRoueChange variable to
            // the hook to both make sure we are listening for route changes and check whether
            // or not we we're on time
            BOOMR.plugins.Angular.hook($rootScope, hadRouteChange);
          }
          return true;
        }
      }

      // If we hooked in correctly we would return true if not we wait for the onBoomerangLoaded event
      // to fire and try again as we can be sure then that Boomerang has arrived in the page
      if (!hookAngularBoomerang()) {
        if (document.addEventListener) {
          document.addEventListener("onBoomerangLoaded", hookAngularBoomerang);
        } else if (document.attachEvent) {
          document.attachEvent("onpropertychange", function (e) {
            e = e || window.event;
            if (e && e.propertyName === "onBoomerangLoaded") {
              hookAngularBoomerang();
            }
          });
        }
      }
    }]
  )
;
