angular.module('nibs.profile', ['nibs.s3uploader', 'nibs.config', 'nibs.status'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            })

            .state('app.edit-profile', {
                url: "/edit-profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/edit-profile.html",
                        controller: "EditProfileCtrl"
                    }
                }
            })

    })

    // Services
    .factory('User', function ($http, $rootScope) {
        return {
            get: function () {
                return $http.get($rootScope.server.url + '/users/me', null)
            },

            update: function (user) {
                return $http.put($rootScope.server.url + '/users/me', user)
            }
        };

    })

    .factory('Preference', function() {

        var preferences = [
            { text: 'Dark', value: 'Dark' },
            { text: 'Milk', value: 'Milk' },
            { text: 'White', value: 'White' }
        ];

        return {
            all: function() {
                return preferences;
            }
        }
    })

    .factory('Size', function() {

        var sizes = [
            { text: 'Small', value: 'Small' },
            { text: 'Medium', value: 'Medium' },
            { text: 'Large', value: 'Large' },
            { text: 'X-Large', value: 'X-Large' }
        ];

        return {
            all: function() {
                return sizes;
            }
        }
    })

    //Controllers
    .controller('ProfileCtrl', function ($window, $rootScope, $scope, $state, User, STATUS_LABELS, STATUS_DESCRIPTIONS) {

        User.get().success(function(user) {
            $rootScope.user = user;
            $scope.statusLabel = STATUS_LABELS[user.status - 1];
            $scope.statusDescription = STATUS_DESCRIPTIONS[user.status - 1];
        });

        $scope.popupDialog = function() {

            if (navigator.notification) {
                navigator.notification.alert(
                    'You have a new message!',  // message
                    function() {                // callback
                        $state.go('app.messages');
                    },
                    'Nibs',                     // title
                    'Open Inbox'             // buttonName
                );
            } else {
                alert('You have a new message!');
                $state.go('app.messages');
            }

        }

    })

    .controller('EditProfileCtrl', function ($scope, $state, $window, $ionicPopup, S3Uploader, User, Preference, Size, Status) {

        User.get().success(function(user) {
            $scope.user = user;
        });
        $scope.preferences = Preference.all();
        $scope.sizes = Size.all();
        $scope.panel = 1;

        $scope.update = function () {
            User.update($scope.user).success(function() {
                Status.show('Your profile has been saved.');
            })
        };

        function errBack() {
            $ionicPopup.alert({title: 'Sorry', content: "Something went wrong!"});
        }

        var videoWidth = 0
        var videoHeight = 0
        var video = document.getElementById('video');

        // Get camera size
        video.onloadedmetadata = function(){
            videoWidth = this.videoWidth
            videoHeight = this.videoHeight
        }

        // Get access to the camera!
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var constraints = {video: { facingMode: "user"}, audio: false} // user front camera
            navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }

        // Trigger photo take
        $scope.takePicture = function() {
            // Elements for taking the snapshot
            var video = document.getElementById('video');
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, videoWidth, videoHeight);

            var canvas = document.getElementById('canvas');
            var img = canvas.toDataURL('image/jpeg')
            $state.go("app.preview", {img: img, isUpdateAvatar: true});
        };
    });
