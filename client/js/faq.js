angular.module('nibs.faq', ['nibs.status', 'ngSanitize'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.faq', {
                url: "/faq",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/faq.html",
                        controller: "FAQCtrl"
                    }
                }
            })

            .state('app.question', {
                url: "/faq/:id",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/question.html",
                        controller: "QuestionCtrl"
                    }
                }
            })
    })

    // Services
    .factory('FAQ', function ($http, $rootScope) {
        return {
            getAll: function(offset, limit) {
                return $http.get($rootScope.server.url + '/faq/' + offset + '/' + limit);
            },
            getById: function(id) {
                return $http.get($rootScope.server.url + '/faq/' + id);
            }
        };
    })

    //Controllers
    .controller('FAQCtrl', function ($scope, $rootScope, $ionicPopup, $ionicModal, FAQ) {
        const firstLoadOffset = 0
        const firstLoadLimit  = 10

        $scope.doRefresh = function() {
            $scope.faq = FAQ.getAll(firstLoadOffset, firstLoadLimit).success(function(result) {
                $scope.faq = result;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.faq = []
        $scope.noResultMessage = ''
        $scope.noMoreItems = false;
        $scope.loadItem = function() {
            var offset = $scope.faq.length == 0 ? firstLoadOffset : $scope.faq.length
            var limit  = $scope.faq.length == 0 ? firstLoadLimit : 5

            FAQ.getAll(offset, limit)
                .success(function(result) {
                    if (result.length != 0) {
                        $scope.faq = $scope.faq.concat(result)
                    } else {
                        if ($scope.faq.length == 0) {
                            $scope.noResultMessage = 'よくある質問はありません'
                        }
                        $scope.noMoreItems = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                })
        }
    })

    .controller('QuestionCtrl', function($rootScope, $scope, $stateParams, $sce, FAQ) {
        FAQ.getById($stateParams.id).success(function(result) {
            $scope.question = result[0];
            $scope.trustedArticlebody = $sce.trustAsHtml($scope.question.articlebody__c);
        });
    })
