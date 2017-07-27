angular.module('mobile.main.controllers')
  .controller('mainCtrl', ['$rootScope', '$scope', '$state', '$q','$ionicLoading', '$cordovaToast', 'index', 'setServeState','orderState', 'getServerTime',
    function ($rootScope, $scope, $state, $q, $ionicLoading, $cordovaToast, index, setServeState, orderState, getServerTime) {
      $scope.indexInfo = {}
      $scope.toggleServeState = true;
      $scope.indexInfo.portraitSrc = './app/img/common/user_default.png';

      //获取首页数据
      var getIndexInfo = function() {
        getServerTime.save().$promise.then(function(data) {
          if (!data.error) {
            $rootScope.serverTime = data.serverTime;
          }
        }, function(response) {
          $q.reject(response.resultData);
        });

        $ionicLoading.show();
        index($rootScope.token).save().$promise.then(function (data) {
          if (!data.error) {
            $ionicLoading.hide();
            $scope.indexInfo = data;

            if(!$scope.indexInfo.portraitSrc) $scope.indexInfo.portraitSrc = './app/img/common/user_default.png';
            else $scope.indexInfo.portraitSrc = $scope.serverUrl + $scope.indexInfo.portraitSrc;

            if($scope.indexInfo.serveState == 'rest') $scope.indexInfo.serveStateReset = false;
            else $scope.indexInfo.serveStateReset = true;

            if($scope.indexInfo.msgNum > 99) $scope.indexInfo.msgNum = '99+';

            //星星宽度
            $scope.star_a = $scope.indexInfo.engineerGrade.toString().substr(0,1)
            $scope.star_b = $scope.indexInfo.engineerGrade.toString().substr(2,3)
            if(!$scope.star_b){
              $scope.star_b = 0
            }
            $scope.starWidth = parseInt($scope.star_a)*15+2.5+parseInt($scope.star_b);

            $scope.engineerState = $scope.indexInfo.engineerState;//工程师认证状态

            if($scope.indexInfo.engineerState == 'e_a_s_wait_submit'){
              alert('资料未完善无法接单，请完善资料')
              // $cordovaToast.show('资料未完善无法接单，请完善资料', 'long', 'center')
            }else if($scope.indexInfo.engineerState == 'e_a_s_wait_audit'){
              alert('正在审核中...请耐心等待')
              // $cordovaToast.show('正在审核中...请耐心等待', 'long', 'center')
            }else if($scope.indexInfo.engineerState == 'e_a_s_not_passed'){
              alert('抱歉！审核没有通过！（不通过原因：身份证号填写与上传身份证号不一致；）')
              // $cordovaToast.show('抱歉！审核没有通过！（不通过原因：身份证号填写与上传身份证号不一致；）', 'long', 'center')
            }else if($scope.indexInfo.engineerState == 'e_a_s_has_passed'){
              $scope.toggleServeState = false;
            }
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function (response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });

        orderState($rootScope.token).save().$promise.then(function (data) {
          if (!data.error) {
            $rootScope.orderState = data;
          } else {
            alert(data.error)
          }
        }, function (response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      };
      getIndexInfo();

      //控制页面跳转
      $scope.goNext = function (value){
        if($scope.indexInfo.engineerState == 'e_a_s_has_passed'){
          if(value == 'doOrder'){
            $state.go('doOrder')
          }
          if(value == 'unfinishedOrder'){
            $state.go('unfinishedOrder')
          }
          if(value == 'hangupOrder'){
            $state.go('hangupOrder')
          }
          if(value == 'finishedOrder'){
            $state.go('finishedOrder')
          }
          if(value == 'news'){
            $state.go('news')
          }
        }
      }

      $scope.serveStateChange = function() {
        if($scope.indexInfo.engineerState === 'e_a_s_has_passed'){
          var state;
          if ($scope.indexInfo.serveState==='rest') state = 'normal';
          else state = 'rest';

          $ionicLoading.show();
          setServeState($rootScope.token).save({serveState:state}).$promise.then(function (data) {
            if (!data.error) {
              if ($scope.indexInfo.serveStateReset) $scope.indexInfo.serveState = 'normal';
              else $scope.indexInfo.serveState = 'rest';
            } else {
              alert(data.error)
              if ($scope.indexInfo.serveStateReset) $scope.indexInfo.serveStateReset = false;
              else $scope.indexInfo.serveStateReset = true;
            }
            $ionicLoading.hide();
          }, function (response) {
            if ($scope.indexInfo.serveStateReset) $scope.indexInfo.serveStateReset = false;
            else $scope.indexInfo.serveStateReset = true;
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
        }
      };
    }])
