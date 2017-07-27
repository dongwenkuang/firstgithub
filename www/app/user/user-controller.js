angular.module('mobile.user.controllers')
  .controller('userCenterCtrl', ['$rootScope', '$scope', '$stateParams', '$q', '$ionicLoading', 'userCenter',
    function($rootScope, $scope, $stateParams, $q, $ionicLoading, userCenter) {
      userCenter($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
          $scope.userCenter = data;

          $scope.engineerState = $stateParams.engineerState;
          if ($scope.engineerState == 'e_a_s_wait_submit') {
            $scope.engineerStateName = '待提交资料';
          } else if ($scope.engineerState == 'e_a_s_wait_audit') {
            $scope.engineerStateName = '待审核';
          } else if ($scope.engineerState == 'e_a_s_has_passed') {
            $scope.engineerStateName = '已认证';
          } else if ($scope.engineerState == 'e_a_s_not_passed') {
            $scope.engineerStateName = '不通过';
          }

        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
      });
    }
  ])

//基本资料
.controller('basicInfoCtrl', ['$rootScope', '$scope', '$stateParams', '$q', '$ionicLoading', 'queryEngineerInfo',
  function($rootScope, $scope, $stateParams, $q, $ionicLoading, queryEngineerInfo) {
    if ($stateParams.engineerState == 'e_a_s_wait_audit') { //待审核
      $scope.editType = '';
    } else if ($stateParams.engineerState == 'e_a_s_has_passed') { //已认证
      $scope.editType = 'part';
    } else if ($stateParams.engineerState == 'e_a_s_not_passed') { //不通过
      $scope.editType = 'all';
    }

    $rootScope.fullInfo = {};
    $rootScope.formatSkillList = {};

    var getData = function() {
      $ionicLoading.show();
      queryEngineerInfo($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
          $rootScope.fullInfo = data;
          $rootScope.fullInfo.engineerIdentityNo = Number($rootScope.fullInfo.engineerIdentityNo);
          $rootScope.fullInfo.mergencyContactPhone = Number($rootScope.fullInfo.mergencyContactPhone);

          if ($rootScope.fullInfo.engineerPortrait) {
            $rootScope.fullInfo.engineerPortrait = {
              fastSrc: $scope.serverUrl+$rootScope.fullInfo.engineerPortrait.fastSrc,
              originalSrc: $scope.serverUrl+$rootScope.fullInfo.engineerPortrait.originalSrc
            }
          }
          if ($rootScope.fullInfo.engineerFront) {
            $rootScope.fullInfo.engineerFront = {
              fastSrc: $scope.serverUrl+$rootScope.fullInfo.engineerFront.fastSrc,
              originalSrc: $scope.serverUrl+$rootScope.fullInfo.engineerFront.originalSrc
            }
          }
          if ($rootScope.fullInfo.engineerReverse) {
            $rootScope.fullInfo.engineerReverse = {
              fastSrc: $scope.serverUrl+$rootScope.fullInfo.engineerReverse.fastSrc,
              originalSrc: $scope.serverUrl+$rootScope.fullInfo.engineerReverse.originalSrc
            }
          }
          if ($rootScope.fullInfo.engineerHold) {
            $rootScope.fullInfo.engineerHold = {
              fastSrc: $scope.serverUrl+$rootScope.fullInfo.engineerHold.fastSrc,
              originalSrc: $scope.serverUrl+$rootScope.fullInfo.engineerHold.originalSrc
            }
          }
          if ($scope.fullInfo.engineerSkill) {
            $scope.fullInfo.engineerSkill.forEach(function(item) {
              if (!$rootScope.formatSkillList[item.serverType.id]) {
                $rootScope.formatSkillList[item.serverType.id] = {
                  id: item.serverType.id,
                  name: item.serverType.name,
                  list: [{
                    name: item.productType.name,
                    id: item.productType.id
                  }]
                }
              } else {
                $rootScope.formatSkillList[item.serverType.id].list.push({
                  name: item.productType.name,
                  id: item.productType.id
                })
              }
            });
          }
        } else {
          alert(data.error)
        }
        $ionicLoading.hide();
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
      });
    }

    getData()
  }
])

//修改密码
.controller('modifyPsdCtrl', ['$rootScope', '$scope', 'passModify', '$q', '$ionicLoading', '$state',
  function($rootScope, $scope, passModify, $q, $ionicLoading, $state) {
    $scope.modify = {
      oldPassword: '',
      newPassword: '',
      repassword: ''
    }
    $scope.modifyClears = function(x) {
      $scope.modify[x] = ''
    }

    //修改密码
    $scope.modifyPssword = function() {
      if (!$scope.modify.oldPassword) alert('请输入原密码');
      else if (!$scope.modify.newPassword) alert('请输入新密码');
      else if ($scope.modify.newPassword.length != 6) alert('请输入6位数字的新密码');
      else if (!$scope.modify.repassword) alert('请输入确认新密码');
      else if ($scope.modify.repassword.length != 6) alert('请输入6位数字的确认新密码');
      else if ($scope.modify.newPassword != $scope.modify.repassword) alert('两次输入密码不一致，请重新输入')
      else {

        var userObj = {};

        userObj.oldPassword = $scope.modify.oldPassword;
        userObj.newPassword = $scope.modify.newPassword;
        userObj.repassword = $scope.modify.repassword;

        passModify($rootScope.token).save(userObj).$promise.then(function(data) {
          if (!data.error) {
            $state.go('setUp')
          } else {
            alert(data.error)
          }
        }, function(response) {
          console.log(response)
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
      }
    }
  }
])
//登出
.controller('setUpCtrl', ['$rootScope', '$scope', 'accountExit', '$q', '$ionicLoading', '$state','$ionicHistory',
  function($rootScope, $scope, accountExit, $q, $ionicLoading, $state, $ionicHistory) {

    $scope.setUpExit = function() {
      $ionicLoading.show();
      accountExit($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
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
          $rootScope.visiting = false;
          window.plugins.jPushPlugin.setAlias('');
          $ionicHistory.clearCache().then(function(){ $state.go('login') });
        } else {
          alert(data.error);
        }
        $ionicLoading.hide();
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
      });
    }
  }
])
