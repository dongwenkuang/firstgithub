angular.module('mobile.authentication.controllers')
  .controller('AuthenticationController', ['$rootScope', '$scope', '$state', '$ionicLoading', 'localStorageService', 'AUTH_EVENTS', '$ionicHistory', '$ionicModal', '$ionicPopup', '$interval', '$cordovaToast', 'SERVER_URL', 'getServerTime', '$q', '$cacheFactory', '$http',
    function($rootScope, $scope, $state, $ionicLoading, localStorageService, AUTH_EVENTS, $ionicHistory, $ionicModal, $ionicPopup, $interval, $cordovaToast, SERVER_URL, getServerTime, $q, $cacheFactory, $http) {
      $scope.serverUrl = SERVER_URL;
      /**
       * It's used to showing a non intrusive native notification which is guaranteed always in the viewport of the browser
       * @param message   Message of the spinner dialog. Leave blank for no message
       */
      $rootScope.showToast = function(message) {
        $cordovaToast.showLongBottom(message);
      };

      $scope.$on(AUTH_EVENTS.pageNotFound, function(event) {
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: '抱歉......',
          template: '您的网络似乎有点问题!'
        });
      });

      $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        $ionicLoading.hide();

        $rootScope.token = '';
        $rootScope.fullInfo = ''; //基本信息
        $rootScope.formatSkillList = ''; //技能
        $rootScope.engineerPortrait = ''; //头像
        $rootScope.engineerFront = ''; //身份证 正面
        $rootScope.engineerReverse = ''; //身份证 反面
        $rootScope.engineerHold = ''; //身份证 手持
        $rootScope.img1 = ''; //拍照完工
        $rootScope.img2 = ''; //拍照完工
        $rootScope.img3 = ''; //拍照完工

        window.plugins.jPushPlugin.setAlias('');
        $ionicHistory.clearCache().then(function() {
          $state.go('login')
        });
      });

      // 返回
      $rootScope.goBack = function(data) {
        if (typeof data === 'string') $state.go(data);
        else {
          data = data || -1;
          $ionicHistory.goBack(data);
        }
      };

      /**
       * view large picture
       * @param viewImages   eg.: ['img/a.jpg','img/b.jpg','img/c.jpg']
       * @param index    the picture index needed to display
       * @param canRemove   To judge whether there is a delete button, [true]:show delete button ,[false]:no delete button
       * @param notServer   To judge whether there is local image, [true]:local image ,[false]:serve image
       */
      $scope.viewPicture = function(viewImages, index, canRemove, notServer) {
        $rootScope.viewImages = viewImages;
        $state.go('viewPicture', {
          canRemove: canRemove,
          index: index,
          notServer: notServer
        });
      };

      // 图片转blob对象
      $scope.dataURLtoBlob = function(url, key) {
        var image = new Image();
        if (url.indexOf('http') > -1) image.setAttribute('crossOrigin', 'anonymous');
        $ionicLoading.show();

        image.onload = function() {
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext("2d");

          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
          var dataurl = canvas.toDataURL('image/jpeg'),
            arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          $rootScope[key] = new Blob([u8arr], {
            type: mime
          });
          $ionicLoading.hide();
        }
        image.src = url;
      };

      // 倒计时
      $scope.runTiming = function() {
        $interval(function() {
          ++$rootScope.serverTime;
        }, 1000);
      };
      $scope.runTiming();

      $scope.time = function(n) {
        setTimeout(function() {
          return n + 1
        }, 1000)
      }

      // 获取当前日期信息
      $scope.getToday = function() {
        var curDate = new Date($rootScope.serverTime * 1000);
        var obj = {
          year: curDate.getFullYear(),
          month: curDate.getMonth() + 1,
          day: curDate.getDate(),
          week: curDate.getDay()
        };
        return obj;
      };

      // 获取当月天数
      $scope.getMonthDay = function(month, year) {
        var leapYear = false,
          day = 31,
          arr = [];

        if ((!year % 4 && year % 100) || !year % 400) leapYear = true;

        if (month === 2 && leapYear) day = 29;
        if (month === 2 && !leapYear) day = 28;
        if (month === 4 || month === 6 || month === 9 || month === 11) day = 30;

        for (var i = 1; i <= day; i++) {
          arr.push(i);
        }
        return arr;
      };

      // 拼接可选日期数组
      $scope.jointDateList = function(month, year) {
        var dayArr = $scope.getMonthDay(month, year);

        for (var x = 1; x <= 12; x++) {
          var tempMonth = month + x,
            tempYear = year;

          if (tempMonth > 12) {
            tempMonth -= 12;
            tempYear++;
          }
          dayArr = dayArr.concat($scope.getMonthDay(tempMonth, tempYear));
        }

        if (dayArr[0] === 1) {
          var leapYear = false,
            additional = [26, 27, 28, 29, 30, 31];
          if ((!year % 4 && year % 100) || !year % 400) leapYear = true;

          if (month === 2 && leapYear) additional = [24, 25, 26, 27, 28, 29];
          if (month === 2 && !leapYear) additional = [23, 24, 25, 26, 27, 28];
          if (month === 4 || month === 6 || month === 9 || month === 11) additional = [25, 26, 27, 28, 29, 30];

          dayArr = additional.concat(dayArr);
        }

        return dayArr;
      };

      // 后台程序重新启动时，再次获取服务器时间
      document.addEventListener('resume', onResume, false);

      function onResume() {
        getServerTime.save({}).$promise.then(function(data) {
          if (!data.error) {
            $rootScope.serverTime = data.serverTime;
          }
        }, function(response) {
          $q.reject(response.resultData);
        });
      }

      // 点击消息进入消息列表页
      document.addEventListener("jpush.openNotification", function(event) {
        $state.go('news');
      }, false)
    }
  ]);
