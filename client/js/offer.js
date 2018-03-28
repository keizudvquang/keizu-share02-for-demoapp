angular.module('nibs.offer', ['openfb', 'nibs.status', 'nibs.activity', 'nibs.wallet'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.offers', {
                url: "/offers",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/offer-list.html",
                        controller: "OfferListCtrl"
                    }
                }
            })

            .state('app.offer-detail', {
                url: "/offers/:offerId",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/offer-detail.html",
                        controller: "OfferDetailCtrl"
                    }
                }
            })

            .state('app.offer-redeem', {
                url: "/offers/:offerId/redeem",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/redeem.html",
                        controller: "OfferDetailCtrl"
                    }
                }
            })
    })

    // Services
    .factory('Offer', function ($http, $rootScope) {
        return {
            all: function(offset, limit) {
                return $http.get($rootScope.server.url + '/offers/' + offset + '/' + limit);
            },
            get: function(offerId, contactId) {
                return $http.post($rootScope.server.url + '/offers/' + offerId, {
                    contactId: contactId
                });
            }
        };
    })

    //Controllers
    .controller('OfferListCtrl', function ($scope, $rootScope, $ionicPopup, $ionicModal, Offer, User) {
        const firstLoadOffset = 0
        const firstLoadLimit  = 10

        $scope.doRefresh = function() {
            $scope.offers = Offer.all(firstLoadOffset, firstLoadLimit).success(function(offers) {
                $scope.offers = offers;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.offers = []
        $scope.noMoreItems = false;
        $scope.loadItem = function() {
            var offset = $scope.offers.length == 0 ? firstLoadOffset : $scope.offers.length
            var limit  = $scope.offers.length == 0 ? firstLoadLimit : 5
            Offer.all(offset, limit).success(function(offers) {
                if (offers.length != 0) {
                    $scope.offers = $scope.offers.concat(offers)
                } else {
                    $scope.noMoreItems = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }
    })

    .controller('OfferDetailCtrl', function ($window, $rootScope, $scope, $state, $ionicPopup, $stateParams, Offer, OpenFB, WalletItem, Activity, Status) {

        Offer.get($stateParams.offerId, JSON.parse($window.localStorage.user).sfid).success(function(offer) {
            $scope.offer = offer;
        });

        $scope.shareOnFacebook = function (offer) {
//      Uncomment to enable actual "Share on Facebook" feature
//            OpenFB.post('/me/feed', {name: offer.name, link: offer.campaignPage, picture: offer.image, caption: 'Offer ends soon!', description: offer.description})
//                .success(function() {
//                    Status.show('Shared on Facebook!');
//                    var activity = new Activity({type: "Shared on Facebook", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image});
//                    activity.$save(Status.checkStatus);
//                })
//                .error(function() {
//                    $ionicPopup.alert({title: 'Facebook', content: 'Something went wrong while sharing this offer.'});
//                });
            Status.show('Shared on Facebook!');
            Activity.create({type: "Shared on Facebook", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
                .success(function(status) {
                    Status.checkStatus(status);
                });

        };

        $scope.shareOnTwitter = function () {
            Status.show('Shared on Twitter!');
            Activity.create({type: "Shared on Twitter", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
                .success(function(status) {
                    Status.checkStatus(status);
                });
        };

        $scope.shareOnGoogle = function () {
            Status.show('Shared on Google+!');
            Activity.create({type: "Shared on Google+", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
                .success(function(status) {
                    Status.checkStatus(status);
                });
        };

        $scope.saveToWallet = function () {
            WalletItem.create({offerId: $scope.offer.id}).success(function(status) {
                Status.show('Saved to your wallet!');
                Activity.create({type: "Saved to Wallet", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image, qrcode: $scope.offer.qrcode})
                    .success(function(status) {
                        Status.checkStatus(status);
                    });
            });
        };

        $scope.redeem = function () {
            Activity.create({type: "Redeemed Offer", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image, qrcode: $scope.offer.qrcode})
                .success(function(status) {
                    Status.checkStatus(status);
                });
            $state.go('app.offer-redeem', {offerId: $scope.offer.id});
        };

    });
