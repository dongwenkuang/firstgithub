// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('mobile', [
  'ionic',
  'ngCordova',
  'mobile.resource',
  'mobile.authentication',
  'mobile.login',
  'mobile.main',
  'mobile.order',
  'mobile.news',
  'mobile.user'
])

.run(['$ionicPlatform', function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      window.plugins.jPushPlugin.init();
      if (device.platform != "Android") {
          window.plugins.jPushPlugin.setDebugModeFromIos();
          window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
      } else {
          window.plugins.jPushPlugin.setDebugMode(true);
          window.plugins.jPushPlugin.setStatisticsOpen(true);
      }
      window.plugins.jPushPlugin.setAlias('');
    });
  }]).config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(3);
    $ionicConfigProvider.views.transition('platform');
    // $ionicConfigProvider.views.forwardCache(false);
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
    $ionicConfigProvider.backButton.text(''); // default is 'Back'
    $ionicConfigProvider.backButton.previousTitleText(false); // hides the 'Back' text

    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
    $ionicConfigProvider.scrolling.jsScrolling(false);


    $stateProvider.state('login', { //登录
        url: '/login',
        templateUrl: function() {
          return './app/login/login.html';
        },
        controller: 'loginCtrl'
      })
      .state('forgotPsd', { //忘记密码
        url: '/forgotPsd',
        templateUrl: function() {
          return './app/login/forgotPsd.html';
        },
        controller: 'forgotPsdCtrl'
      })
      .state('register', { //注册协议
        url: '/register',
        templateUrl: function() {
          return './app/login/register.html';
        }
      })
      .state('regNext', { //注册
        url: '/regNext',
        templateUrl: function() {
          return './app/login/regNext.html';
        },
        controller: 'regCtrl'
      })
      .state('completeMaterial', { //完善资料
        url: '/completeMaterial/:editType',
        templateUrl: function() {
          return './app/login/completeMaterial.html';
        },
        controller: 'MaterialCtrl'
      })
      .state('clipImage', { //裁剪头像
        url: '/clipImage',
        templateUrl: function() {
          return './app/login/clipImage.html';
        },
        controller: 'clipImageCtrl'
      })
      .state('addSkill', { //新增服务技能
        url: '/addSkill',
        templateUrl: function() {
          return './app/login/addSkill.html';
        }
      })
      .state('index', { //首页
        url: '/index',
        templateUrl: function() {
          return './app/main/index.html';
        },
        controller: 'mainCtrl',
        cache: false
      })
      .state('news', { //我的消息
        url: '/news',
        templateUrl: function() {
          return './app/news/news.html';
        },
        controller: 'newsCtrl'
      })
      .state('finishedOrder', { //完工单查询
        url: '/finishedOrder',
        templateUrl: function() {
          return './app/order/finishedOrder.html';
        },
        controller: 'finishedOrderCtrl'
      })
      .state('doOrder', { //待接工单
        url: '/doOrder',
        templateUrl: function() {
          return './app/order/doOrder.html';
        },
        controller: 'doOrderCtrl'
      })
      .state('unfinishedOrder', { //未完工单
        url: '/unfinishedOrder',
        templateUrl: function() {
          return './app/order/unfinishedOrder.html';
        },
        controller: 'unfinishedOrderCtrl'
      })
      .state('hangupOrder', { //挂起工单
        url: '/hangupOrder',
        templateUrl: function() {
          return './app/order/hangupOrder.html';
        },
        controller: 'hangupOrderCtrl'
      })
      .state('orderDetail', { //工单详情
        url: '/orderDetail/:orderId',
        templateUrl: function() {
          return './app/order/orderDetail.html';
        },
        controller: 'orderDeatailCtrl'
      })
      .state('completeOrder', { //拍照完工
        url: '/completeOrder/:orderId',
        templateUrl: function() {
          return './app/order/completeOrder.html';
        },
        controller: 'completeOrderCtrl'
      })
      .state('memo', { //备忘
        url: '/memo/:orderId',
        templateUrl: function() {
          return './app/order/memo.html';
        },
        controller: 'memoCtrl'
      })
      .state('userCenter', { //个人中心
        url: '/userCenter/:engineerState',
        templateUrl: function() {
          return './app/user/userCenter.html';
        },
        controller: 'userCenterCtrl'
      })
      .state('basicInfo', { //基本信息
        url: '/basicInfo/:engineerState',
        templateUrl: function() {
          return './app/user/basicInfo.html';
        },
        controller: 'basicInfoCtrl',
        cache: false
      })
      .state('bankCardInfo', { //银行卡信息
        url: '/bankCardInfo',
        templateUrl: function() {
          return './app/user/bankCardInfo.html';
        }
      })
      .state('myIncome', { //我的收入
        url: '/myIncome',
        templateUrl: function() {
          return './app/user/myIncome.html';
        }
      })
      .state('totalIncome', { //累计收入
        url: '/totalIncome',
        templateUrl: function() {
          return './app/user/totalIncome.html';
        }
      })
      .state('thisMonthIncome', { //本月收入
        url: '/thisMonthIncome',
        templateUrl: function() {
          return './app/user/thisMonthIncome.html';
        }
      })
      .state('setUp', { //设置
        url: '/setUp',
        templateUrl: function() {
          return './app/user/setUp.html';
        },
        controller: 'setUpCtrl'
      })
      .state('modifyPsd', { //修改密码
        url: '/modifyPsd',
        templateUrl: function() {
          return './app/user/modifyPsd.html';
        },
        controller: 'modifyPsdCtrl'
      })

    $urlRouterProvider.otherwise("/login");

  }])
  .run(['$rootScope', '$state', '$stateParams', '$cordovaToast', '$q', '$ionicPlatform',
    function($rootScope, $state, $stateParams, $cordovaToast, $q, $ionicPlatform) {
      $rootScope.$on('$stateChangeStart', function(event, next, nextParams, from, fromParams) {
        var token = $rootScope.token;

        if (next.name === 'index') $rootScope.mainWrp = true;
        else $rootScope.mainWrp = false;

        // 如果用户在登录后直接访问未登录页面则跳转到首页
        if ((next.name === 'login' || next.name === 'forgotPsd' || next.name === 'register' || next.name === 'regNext') && token) {
          event.preventDefault();
          $state.go('index');
        }
        // 如果用户在未登录时直接访问登录后的页面则跳转到登录页面
        if (next.name !== 'login' && next.name !== 'forgotPsd' && next.name !== 'register' && next.name !== 'regNext' && !token) {
          event.preventDefault();
          $state.go('login');
        }
        // 首页不可返回编辑
        if (from.name === 'index' && next.name === 'completeMaterial' && $rootScope.completeMaterSuccess) {
          event.preventDefault();
        }
        // 完善资料页面默认返回首页
        if (from.name === 'completeMaterial' && fromParams.editType === 'all' && next.name !== 'index' && next.name !== 'userCenter' && next.name !== 'clipImage') {
          event.preventDefault();
          $state.go('index');
        }
        //从工单详情里返回  清空值
        if (from.name === 'orderDetail') {
          if (next.name === 'doOrder' || next.name === 'unfinishedOrder' || next.name === 'finishedOrder' || next.name === 'news') {
            delete $rootScope.orderDeatail;
          }
        }
      });

      //双击退出
      $ionicPlatform.registerBackButtonAction(function(e) {
        if ($rootScope.backButtonPressedOnceToExit) {
          ionic.Platform.exitApp();
        } else {
          $rootScope.backButtonPressedOnceToExit = true;
          $cordovaToast.show('再按一次退出系统', 'short', 'bottom');
          setTimeout(function() {
            $rootScope.backButtonPressedOnceToExit = false;
          }, 2000);
        }
        e.preventDefault();
        return false;
      }, 101);

      window.addEventListener('native.showkeyboard', function(e){
        if (device.platform === 'Android') {
          var scroll = $('[nav-view="active"]').find('.scroll-view').scrollTop()
          $('[nav-view="active"]').find('.scroll-view').scrollTop(scroll+e.keyboardHeight);
        }
        // if (device.platform === 'iOS') {
        //   $('[nav-view="active"]').find('.scroll-view').css('top',-e.keyboardHeight+'px');
        // }
      });

      // window.addEventListener('native.keyboardhide', function(e){
      //   if (device.platform === 'iOS') {
      //     $('[nav-view="active"]').find('.scroll-view').css('top',0);
      //   }
      // });
    }
  ]);
