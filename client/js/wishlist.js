angular.module('nibs.wishlist', ['nibs.status'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.wishlist', {
                url: "/wishlist",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/wishlist.html",
                        controller: "WishListCtrl"
                    }
                }
            })
    })

    // Services
    .factory('WishListItem', function ($http, $rootScope) {
        return {
            all: function(offset, limit) {
                return $http.get($rootScope.server.url + '/wishlist/' + offset + '/' + limit);
            },
            create: function(wishlistItem) {
                return $http.post($rootScope.server.url + '/wishlist', wishlistItem);
            },
            del: function(productId, productSFID, points) {
                return $http.delete($rootScope.server.url + '/wishlist/' + productId, {
                    data : {productSFID: productSFID, points: points}, headers: {"Content-Type": "application/json;charset=utf-8"}
                });
            }
        };
    })

    // Controllers
    .controller('WishListCtrl', function ($scope, WishListItem, Status) {
        const firstLoadOffset = 0;
        const firstLoadLimit  = 10;

        $scope.deleteItem = function(product) {
            WishListItem.del(product.id, product.sfid, 1000).success(function(dataStatus) {
                $scope.products.splice($scope.products.indexOf(product), 1);
                Status.checkStatus(dataStatus);
            });
        };

        $scope.products = [];
        $scope.noMoreItems = false;
        $scope.loadItem = function() {
            var offset = $scope.products.length == 0 ? firstLoadOffset : $scope.products.length;
            var limit  = $scope.products.length == 0 ? firstLoadLimit : 5;
            WishListItem.all(offset, limit).success(function(products) {
                if (products.length != 0) {
                    $scope.products = $scope.products.concat(products);
                } else {
                    $scope.noMoreItems = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    });