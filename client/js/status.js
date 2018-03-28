angular.module('nibs.status', [])

    .factory('Status', function ($window, $rootScope, $ionicPopup, STATUS_LABELS) {

        function show(message) {
            var el = angular.element('<div class="notification">' + message + '</div>');
            angular.element(document.body).append(el);
            setTimeout(function() {
                el.remove();
            }, 1500);
        }

        function checkStatus(data) {
            if (data.originalStatus !== data.newStatus) {
                $rootScope.user.status = data.newStatus;
                var userFromLocalStorage = JSON.parse($window.localStorage.getItem("user"));
                userFromLocalStorage.status = data.newStatus;
                $window.localStorage.setItem("user",JSON.stringify(userFromLocalStorage));
                
                $ionicPopup.show({
                    title: 'おめでとうございます！<br>' + $rootScope.user.lastname + '　' + $rootScope.user.firstname + 'さん！',
                    template:
                        '<div style="text-align: center" class="status' + data.newStatus + '">' +
                        '<p>あなたは新しいステータスにランクアップしました！</p>' +
                        '<img src="css/img/icon-status' + data.newStatus + '.svg" height="120"/>' +
                        '<h3 class="status' + data.newStatus + '">' + STATUS_LABELS[data.newStatus - 1] + ' Member</h3>' +
                        '<h4 class="status' + data.newStatus + '">' + data.newBalance + ' Nibs</h4>',
                    buttons: [{
                        text: 'OK'
                    }]
                });
            }
        }

        return {
            show: show,
            checkStatus: checkStatus
        }

    });
