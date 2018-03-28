angular.module('nibs.activity', [])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.activity', {
                url: "/activity",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/activity-list.html",
                        controller: "ActivityCtrl"
                    }
                }
            })

    })

    // Services
    .factory('Activity', function ($http, $rootScope) {
        return {
            all: function(offset, limit) {
                return $http.get($rootScope.server.url + '/activities/' + offset + '/' + limit);
            },
            create: function(activity) {
                return $http.post($rootScope.server.url + '/activities/', activity);
            },
            deleteAll: function() {
                return $http.delete($rootScope.server.url + '/activities');
            }
        };
    })

    //Controllers
    .controller('ActivityCtrl', function ($scope, $state, Activity) {
        const firstLoadOffset = 0
        const firstLoadLimit  = 10

        $scope.doRefresh = function() {
            Activity.all(firstLoadOffset, firstLoadLimit).success(function(activities) {
                $scope.activities = activities;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.activities = []
        $scope.noMoreItems = false;
        $scope.loadItem = function() {
            var offset = $scope.activities.length == 0 ? firstLoadOffset : $scope.activities.length
            var limit  = $scope.activities.length == 0 ? firstLoadLimit : 5
            Activity.all(offset, limit).success(function(activities) {
                if (activities.length != 0) {
                    $scope.activities = $scope.activities.concat(activities)
                } else {
                    $scope.noMoreItems = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }
    });