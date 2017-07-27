angular.module('mobile.login.controllers')
  .controller('loginCtrl', ['$rootScope', '$scope', '$state', '$cordovaToast', '$ionicPopup', '$ionicLoading', '$q', 'userLogin', '$timeout',
    function($rootScope, $scope, $state, $cordovaToast, $ionicPopup, $ionicLoading, $q, userLogin,$timeout) {
      if ($rootScope.visiting) {
        var alertPopup = $ionicPopup.alert({
          title: '警告',
          template: '您的账号登录超时或在其他设备登录，若不是您本人的行为请及时修改密码!'
        });
        $rootScope.visiting = false;
      }

      $scope.login = {}
      $scope.loginClears = function(x) {
        $scope.login[x] = '';
        $timeout(function(){
          $('#'+x).focus();
        },100);
      }

      $scope.userLogin = function() {
        var reg = /^1(?:3[0-9]|147|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
        if (!$scope.login.userId) $cordovaToast.show('请输入账号', 'short', 'center')
        else if (!reg.test($scope.login.userId.toString())) alert('请输入正确的手机号格式');
        else if (!$scope.login.password) $cordovaToast.show('请输入密码', 'short', 'center')
        else {
          $ionicLoading.show();
          var login = {
            userId: $scope.login.userId.toString(),
            password: $scope.login.password
          };

          userLogin.save(login).$promise.then(function(data) {
            if (!data.error) {
              $rootScope.token = data.token;
              $rootScope.visiting = true;
              window.plugins.jPushPlugin.setAlias(login.userId);

              $state.go('index');
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }
    }
  ])
  .controller('regCtrl', ['$rootScope', '$scope', '$state', '$q', '$ionicLoading', 'getRUserSMSCode', 'registerUser', '$interval', 'userLogin',
    function($rootScope, $scope, $state, $q, $ionicLoading, getRUserSMSCode, registerUser, $interval, userLogin) {
      $scope.reg = {}
      $scope.regClears = function(x) {
        $scope.reg[x] = ''
      }

      //发送验证码
      $scope.serverTime = '发送验证码';
      var stop;
      $scope.sendSms = function() {
        var reg = /^1(?:3[0-9]|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
        if (!$scope.reg.userId) {
          alert('请输入手机号')
        } else if (!reg.test($scope.reg.userId.toString())) {
          alert('请输入正确的手机号');
        } else {

          $scope.sendSmsDisabled = true;
          //短信验证码 倒计时
          $scope.serverTime = 60;
          $scope.sendSmsFlag = true;
          if (angular.isDefined(stop)) return;

          stop = $interval(function() {
            if ($scope.serverTime > 1) {
              $scope.serverTime = $scope.serverTime - 1;
            } else {
              $scope.stopFight();
              $scope.serverTime = '发送验证码';
              $scope.sendSmsFlag = false;
              $scope.sendSmsDisabled = false;
            }
          }, 1000);

          getRUserSMSCode.save({
            telephone: $scope.reg.userId.toString()
          }).$promise.then(function(data) {
            if (!data.error) {

            } else {
              alert(data.error)
              $scope.stopFight();
              $scope.serverTime = '发送验证码';
              $scope.sendSmsFlag = false;
              $scope.sendSmsDisabled = false;
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }
      $scope.stopFight = function() {
        if (angular.isDefined(stop)) {
          $interval.cancel(stop);
          stop = undefined;
        }
      };

      //注册
      $scope.userRegister = function() {
        var reg = /^1(?:3[0-9]|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
        if (!$scope.reg.userId) alert('请填写手机号');
        else if (!reg.test($scope.reg.userId.toString())) alert('请输入正确的手机号');
        else if (!$scope.reg.authCode) alert('请输入验证码');
        else if (!$scope.reg.password) alert('请输入密码');
        else if ($scope.reg.password.length != 6) alert('请输入6位数字的密码');
        else if (!$scope.reg.repassword) alert('请输入确认密码');
        else if ($scope.reg.repassword.length != 6) alert('请输入6位数字的确认密码');
        else if ($scope.reg.password != $scope.reg.repassword) alert('两次输入密码不一致，请重新输入')
        else {
          $ionicLoading.show();
          var reg = {
            userId: $scope.reg.userId.toString(),
            authCode: $scope.reg.authCode.toString(),
            password: $scope.reg.password,
            repassword: $scope.reg.repassword
          }
          registerUser.save(reg).$promise.then(function(data) {
            if (!data.error) {
              $rootScope.token = data.token;
              $rootScope.visiting = true;
              window.plugins.jPushPlugin.setAlias(reg.userId);
              $state.go('completeMaterial', {
                editType: 'all'
              })
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }
    }
  ])
  .controller('forgotPsdCtrl', ['$rootScope', '$scope', '$state', '$q', '$ionicLoading', '$interval', 'getFpswSmsCode', 'resetPassword',
    function($rootScope, $scope, $state, $q, $ionicLoading, $interval, getFpswSmsCode, resetPassword) {

      $scope.forgetForm = {}
      $scope.FpswClear = function(x) {
        $scope.forgetForm[x] = ''
      }

      //发送验证码
      $scope.serverTime = '发送验证码';
      var stop;
      $scope.sendSms = function() {
        var reg = /^1(?:3[0-9]|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
        if (!$scope.forgetForm.telephone) {
          alert('请输入手机号')
        } else if (!reg.test($scope.forgetForm.telephone.toString())) {
          alert('请输入正确的手机号');
        } else {
          //短信验证码 倒计时
          $scope.serverTime = 60;
          $scope.sendSmsDisabled = true;
          $scope.sendSmsFlag = true;
          if (angular.isDefined(stop)) return;

          stop = $interval(function() {
            if ($scope.serverTime > 1) {
              $scope.serverTime = $scope.serverTime - 1;
            } else {
              $scope.stopFight();
              $scope.serverTime = '发送验证码';
              $scope.sendSmsFlag = false;
              $scope.sendSmsDisabled = false;
            }
          }, 1000);

          getFpswSmsCode.save({
            telephone: $scope.forgetForm.telephone
          }).$promise.then(function(data) {
            if (!data.error) {

            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }
      $scope.stopFight = function() {
        if (angular.isDefined(stop)) {
          $interval.cancel(stop);
          stop = undefined;
        }
      };

      //忘记密码  完成
      $scope.submitFpsw = function() {
        var reg = /^1(?:3[0-9]|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
        if (!$scope.forgetForm.telephone) alert('请填写手机号');
        else if (!reg.test($scope.forgetForm.telephone.toString())) alert('请输入正确的手机号');
        else if (!$scope.forgetForm.code) alert('请输入验证码');
        else if (!$scope.forgetForm.newPassword) alert('请输入新密码');
        else if ($scope.forgetForm.newPassword.length != 6) alert('请输入6位数字的新密码');
        else if (!$scope.forgetForm.repassword) alert('请输入确认新密码');
        else if ($scope.forgetForm.repassword.length != 6) alert('请输入6位数字的确认新密码');
        else if ($scope.forgetForm.newPassword != $scope.forgetForm.repassword) alert('两次输入密码不一致，请重新输入')
        else {
          $ionicLoading.show();
          var userObj = {};

          userObj.telephone = $scope.forgetForm.telephone.toString();
          userObj.code = $scope.forgetForm.code.toString();
          userObj.newPassword = $scope.forgetForm.newPassword;
          userObj.repassword = $scope.forgetForm.repassword;

          resetPassword.save(userObj).$promise.then(function(data) {
            if (!data.error) {
              $state.go('login');
              $scope.forgetForm = {}
              $scope.stopFight();
              $scope.serverTime = '发送验证码';
              $scope.sendSmsFlag = false;
              $scope.sendSmsDisabled = false;
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }

    }
  ])
  .controller('MaterialCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$ionicActionSheet', '$cordovaCamera', '$cordovaImagePicker', '$ionicModal', '$ionicSlideBoxDelegate', '$cordovaToast', '$state', '$q', '$ionicLoading', 'getServeType', 'getProductCategory', 'getGeoList', 'getServeGeoList', 'submitBasicInfo', 'queryEngineerInfo',
    function($rootScope, $scope, $stateParams, $timeout, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $ionicModal, $ionicSlideBoxDelegate, $cordovaToast, $state, $q, $ionicLoading, getServeType, getProductCategory, getGeoList, getServeGeoList, submitBasicInfo, queryEngineerInfo) {
      //标记用户已访问过
      $rootScope.visitedComp = $rootScope.token;

      // 是否可编辑全部字段
      if ($stateParams.editType === 'all') $scope.isAllEdit = true;
      if ($stateParams.editType === 'part') $scope.isAllEdit = false;

      // 页面标题
      if ($scope.isAllEdit) $scope.title = '完善资料';
      else $scope.title = '基本资料';

      // 初始化表单数据
      $scope.form = {}
      if ($rootScope.fullInfo) {
        for (var x in $rootScope.fullInfo) {
          $scope.form[x] = $rootScope.fullInfo[x]
        }
      }
      $scope.choose = {};

      // 读取图片数据
      $rootScope.userImg = '';
      if ($rootScope.fullInfo) {
        $rootScope.userImg = $rootScope.fullInfo.engineerPortrait.fastSrc;
        $scope.dataURLtoBlob($rootScope.fullInfo.engineerPortrait.originalSrc, 'engineerPortrait');
        $scope.dataURLtoBlob($rootScope.fullInfo.engineerFront.originalSrc, 'engineerFront');
        $scope.dataURLtoBlob($rootScope.fullInfo.engineerReverse.originalSrc, 'engineerReverse');
        $scope.dataURLtoBlob($rootScope.fullInfo.engineerHold.originalSrc, 'engineerHold');
      }

      // 定义获取所在地选择列表方法
      var getGeoListData = function(index) {
        $ionicLoading.show();
        var userObj = {};

        if (index === 1) userObj.provinceId = $scope.choose.engineerProvince || $scope.areaRegion.province.id;
        else if (index === 2) {
          var userObj = {
            provinceId: $scope.choose.engineerProvince || $scope.areaRegion.province.id,
            cityId: $scope.choose.engineerCity || $scope.areaRegion.city.id
          }
        }
        getGeoList($rootScope.token).save(userObj).$promise.then(function(data) {
          if (!data.error) {
            if (index === 0) $scope.engineerProvinceList = data.dataList;
            else if (index === 1) $scope.engineerCityList = data.dataList;
            else if (index === 2) $scope.engineerRegionList = data.dataList;
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      };

      // 定义获取服务区域选择列表方法
      var getServeGeoListata = function(index) {
        $ionicLoading.show();
        var userObj = {};

        if (index === 1) userObj.provinceId = $scope.choose.engineerServerProvince || $scope.areaServer.province.id;
        else if (index === 2) {
          var userObj = {
            provinceId: $scope.choose.engineerServerProvince || $scope.areaServer.province.id,
            cityId: $scope.choose.engineerServerCity || $scope.areaServer.city.id
          }
        }
        getServeGeoList($rootScope.token).save(userObj).$promise.then(function(data) {
          if (!data.error) {
            if (index === 0) $scope.engineerServerProvinceList = data.dataList;
            else if (index === 1) $scope.engineerServerCityList = data.dataList;
            else if (index === 2) $scope.engineerServerRegionList = data.dataList;
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      };

      getGeoListData(0);
      getServeGeoListata(0);

      // 初始化所在地数据
      $scope.areaRegion = {province: '',city: '',area: ''};
      $scope.areaRegionLabel = {};
      if ($scope.form && $scope.form.engineerProvince) {
        $scope.areaRegion = {
          province: $scope.form.engineerProvince,
          city: $scope.form.engineerCity,
          area: $scope.form.engineerRegion
        }
        $scope.areaRegionLabel = {
          province: $scope.form.engineerProvince.name,
          city: $scope.form.engineerCity.name,
          area: $scope.form.engineerRegion.name
        }
        $scope.choose.engineerProvince = $scope.form.engineerProvince.id;
        $scope.choose.engineerCity = $scope.form.engineerCity.id;
        $scope.choose.engineerRegion = $scope.form.engineerRegion.id;
        $scope.areaRegionShow = $scope.form.engineerProvince.name + $scope.form.engineerCity.name + $scope.form.engineerRegion.name;
        getGeoListData(1);
        getGeoListData(2);
      }

      // 初始化服务区域数据
      $scope.areaServer = {province: '',city: '',area: []};
      $scope.areaServerLabel = {};
      if ($scope.form && $scope.form.engineerServeProvince) {
        $scope.areaServer = {
          province: $scope.form.engineerServeProvince,
          city: $scope.form.engineerServeCity,
          area: $scope.form.engineerServeRegion
        }

        $scope.choose.engineerServerProvince = $scope.form.engineerServeProvince.id;
        $scope.choose.engineerServerCity = $scope.form.engineerServeCity.id;
        $scope.choose.engineerServerRegion = {};
        $scope.form.engineerServeRegion.forEach(function(item){
          $scope.choose.engineerServerRegion[item.id] = item.id;
        });

        var areaNameArr = $scope.form.engineerServeRegion.map(function(item) {
          return item.name
        });
        $scope.areaServerLabel = {
          province: $scope.form.engineerServeProvince.name,
          city: $scope.form.engineerServeCity.name
        }
        if (areaNameArr.length === 1) $scope.areaServerLabel.area = areaNameArr[0];
        if (areaNameArr.length > 1) $scope.areaServerLabel.area = areaNameArr.length + '个区域';
        $scope.areaServerShow = $scope.form.engineerServeProvince.name + $scope.form.engineerServeCity.name + areaNameArr.join(',');
        $scope.serverTempArr = $scope.areaServer.area
        getServeGeoListata(1);
        getServeGeoListata(2);
      }

      // 初始化地区选择控件
      $scope.tabIndex = 0;
      $scope.showAreaBox = false;
      $scope.areaSelected = true;
      $scope.markShow = true;

      //定义选择照片的函数，
      $scope.maxPhotos = 1;

      // 选择图片方法
      $scope.choosePic = function(value) {
        if (!$scope.isAllEdit) return false;

        cordova.plugins.Keyboard.close();

        var type = 'gallery';
        $ionicActionSheet.show({
          buttons: [{
            text: '拍照'
          }, {
            text: '从相册选择'
          }],
          cancelText: '取消',
          cancel: function() {},
          buttonClicked: function(index) {
            if (index == 0) {
              type = 'camera';
              var options = {
                //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
                quality: 80, //相片质量0-100
                destinationType: Camera.DestinationType.FILE_URI, //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
                sourceType: Camera.PictureSourceType.CAMERA, //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
                allowEdit: false, //在选择之前允许修改截图
                encodingType: Camera.EncodingType.JPEG, //保存的图片格式： JPEG = 0, PNG = 1
                targetWidth: 1200, //照片宽度
                targetHeight: 1200, //照片高度
                mediaType: 0, //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
                cameraDirection: 0, //枪后摄像头类型：Back= 0,Front-facing = 1
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true, //保存进手机相册
                correctOrientation: true
              };
              $cordovaCamera.getPicture(options).then(function(imageData) {
                if (value == 0) {
                  $scope.form.engineerFront = {
                    fastSrc: imageData
                  }
                  $scope.dataURLtoBlob(imageData, 'engineerFront');
                } else if (value == 1) {
                  $scope.form.engineerReverse = {
                    fastSrc: imageData
                  }
                  $scope.dataURLtoBlob(imageData, 'engineerReverse');
                } else if (value == 2) {
                  $scope.form.engineerHold = {
                    fastSrc: imageData
                  }
                  $scope.dataURLtoBlob(imageData, 'engineerHold');
                } else if (value == 3) {
                  $rootScope.userImg = imageData;
                  $state.go('clipImage');
                }
              }, function(err) {
                // error
                //CommonJs.AlertPopup(err.message);
              });
            } else if (index == 1) {
              type = 'gallery';
              var options = {
                maximumImagesCount: 1,
                width: 1200,
                height: 1200,
                quality: 100
              };

              $cordovaImagePicker.getPictures(options)
                .then(function(results) {
                  if (results.length) {
                    if (value == 0) {
                      $scope.form.engineerFront = {
                        fastSrc: results[0]
                      }
                      $scope.dataURLtoBlob(results[0], 'engineerFront');
                    } else if (value == 1) {
                      $scope.form.engineerReverse = {
                        fastSrc: results[0]
                      }
                      $scope.dataURLtoBlob(results[0], 'engineerReverse');
                    } else if (value == 2) {
                      $scope.form.engineerHold = {
                        fastSrc: results[0]
                      }
                      $scope.dataURLtoBlob(results[0], 'engineerHold');
                    } else if (value == 3) {
                      $rootScope.userImg = results[0];
                      $state.go('clipImage');
                    }
                  }
                }, function(error) {
                  // error getting photos
                });
            }
            return true;
          }
        });
      }

      // 删除图片方法
      $scope.deleteImages = function(type) {
        if (type == 0) {
          $rootScope.engineerFront = '';
          $scope.form.engineerFront = '';
        } else if (type == 1) {
          $rootScope.engineerReverse = '';
          $scope.form.engineerReverse = '';
        } else if (type == 2) {
          $rootScope.engineerHold = '';
          $scope.form.engineerHold = '';
        }
      }

      //显示区域选择弹窗
      $scope.showAreaBoxBtn = function(value) {
        $scope.showAreaBox = true;
        if (!value) { //所在地区
          $scope.single = true;
          $scope.multiple = false;
          $scope.areaRegionTempLabel = $scope.areaRegionLabel;
          if ($scope.areaRegion.area) $scope.areaSelected = false;
          if ($scope.areaRegionTempLabel && !$scope.areaRegion.area) {
            $scope.areaSelected = true;
          }
        } else { //服务区域
          $scope.single = false;
          $scope.multiple = true;
          $scope.areaServerTempLabel = $scope.areaServerLabel;
          if ($scope.areaServer.area) $scope.areaSelected = false;
          if ($scope.areaServerTempLabel && !$scope.areaServer.area.length) {
            $scope.areaSelected = true;
          }
        }
      };

      //关闭区域选择弹窗
      $scope.hideAreaBox = function() {
        $scope.showAreaBox = false;
      }

      // 切换选择提示
      $scope.activeTab = function(index, cur) {
        if (index !== undefined) {
          $scope.tabIndex = index;
          $ionicSlideBoxDelegate.slide(index);

          if (cur) $scope.markShow = true;
          else $scope.markShow = false;
        }
      };

      //禁止滑动
      $scope.disableSwipe = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
      };

      //滚动到指定slide
      $scope.slideTo = function(index, key, item) {
        $ionicSlideBoxDelegate.slide(index + 1);
        if ($scope.single) {
          $scope.areaRegionTempLabel[key] = item.name;
          if ($scope.areaRegion[key].id !== item.id) {
            $scope.choose.engineerRegion = '';
            $scope.areaRegionTempLabel.area = '';
            if (!index) {
              $scope.choose.engineerCity = '';
              $scope.areaRegionTempLabel.city = '';
            }
            $scope.areaSelected = true;
          }
        } else {
          $scope.areaServerTempLabel[key] = item.name;
          if ($scope.areaServer[key].id !== item.id) {
            $scope.serverTempArr = [];
            $scope.choose.engineerServeRegion = '';
            $scope.areaServerTempLabel.area = '';
            if (!index) {
              $scope.choose.engineerServeCity = '';
              $scope.areaServerTempLabel.city = '';
            }
            $scope.areaSelected = true;
          }
        }
        $scope.site = index + 1;
        $scope.markShow = true;
      };

      // 判断是否要重新请求地区列表
      $scope.$watch('choose',function(newVal,oldVal){
        if (newVal.engineerProvince !== oldVal.engineerProvince) getGeoListData(1);
        if (newVal.engineerCity !== oldVal.engineerCity) getGeoListData(2);
        if (newVal.engineerServerProvince !== oldVal.engineerServerProvince) getServeGeoListata(1);
        if (newVal.engineerServerCity !== oldVal.engineerServerCity) getServeGeoListata(2);
      },true);

      // 选择所在区
      $scope.RegionCg = function(name) {
        $scope.areaRegionTempLabel.area = name;
        $scope.areaSelected = false;
      };

      // 选择服务区
      $scope.ServerCg = function(item) {
        if ($scope.choose.engineerServerRegion[item.id]) {
          $scope.serverTempArr.push(item);
        } else {
          $scope.serverTempArr = $scope.serverTempArr.filter(function(items) {
            return items.id != item.id;
          });
        }

        if ($scope.serverTempArr.length > 1) {
          $scope.areaServerTempLabel.area = $scope.serverTempArr.length + '个区域';
          $scope.areaSelected = false;
        } else if ($scope.serverTempArr.length === 1) {
          $scope.areaServerTempLabel.area = $scope.serverTempArr[0].name;
          $scope.areaSelected = false;
        } else {
          $scope.areaServerTempLabel.area = '';
          $scope.areaSelected = true;
        }
      }

      // 判断服务区是否被选中
      $scope.includeArr = function(id) {
        if ($scope.areaServer.area) {
          var result = $scope.areaServer.area.filter(function(item) {
            return item.id === id;
          });

          if (result.length) return true;
        }
        return false;
      };

      // 选择所在地或服务区域
      $scope.showAreaBoxSave = function(type) {
        if (!type) { //所在地区
          if (!$scope.areaRegion.area && (!$scope.choose.engineerProvince || !$scope.choose.engineerCity || !$scope.choose.engineerRegion)) {
            alert('请选择后再保存')
          } else {
            if ($scope.choose.engineerRegion) {
              $scope.areaRegion = {
                province: $scope.engineerProvinceList.filter(function(item) {
                  return item.id === $scope.choose.engineerProvince
                })[0],
                city: $scope.engineerCityList.filter(function(item) {
                  return item.id === $scope.choose.engineerCity
                })[0],
                area: $scope.engineerRegionList.filter(function(item) {
                  return item.id === $scope.choose.engineerRegion
                })[0]
              };
              $scope.areaRegionLabel = $scope.areaRegionTempLabel;
              $scope.areaRegionShow = $scope.areaRegionLabel.province + $scope.areaRegionLabel.city + $scope.areaRegionLabel.area;
            }
            $scope.showAreaBox = false;
          }
        } else { //服务区域
          if (!$scope.areaServer.area && (!$scope.choose.engineerServerProvince || !$scope.choose.engineerServerCity || !$scope.serverTempArr.length)) {
            alert('请选择后再保存')
          } else {
            if ($scope.serverTempArr.length) {
              $scope.areaServer = {
                province: $scope.engineerServerProvinceList.filter(function(item) {
                  return item.id === $scope.choose.engineerServerProvince
                })[0],
                city: $scope.engineerServerCityList.filter(function(item) {
                  return item.id === $scope.choose.engineerServerCity
                })[0],
                area: $scope.serverTempArr
              };
              $scope.areaServerLabel = $scope.areaServerTempLabel;
              $scope.areaServerShow = $scope.areaServerLabel.province + $scope.areaServerLabel.city + '-' + $scope.serverTempArr.map(function(item) {
                return item.name
              }).join(',');
            }
            $scope.showAreaBox = false;
          }
        }
      }

      // 初始化服务技能数据
      $scope.engineerSkill = [];
      $scope.skillList = {};
      $scope.skillList.productType = {};

      $scope.MaterialformatSkillList = $rootScope.formatSkillList || {};
      $scope.formatSkillListLength = Object.keys($scope.MaterialformatSkillList).length;

      if($scope.MaterialformatSkillList){
        for (x in $scope.MaterialformatSkillList) {
          $scope.MaterialformatSkillList[x].list.forEach(function(item) {
            $scope.engineerSkill.push({
              serverType: {
                id: $scope.MaterialformatSkillList[x].id,
                name: $scope.MaterialformatSkillList[x].name
              },
              productType: item
            })
          })
        }
      }

      //添加技能modal
      $ionicModal.fromTemplateUrl('app/login/addSkill.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;

        //获取服务类别
        getServeType($rootScope.token).save().$promise.then(function(data) {
          if (!data.error) {
            $scope.serveTypeList = data.serveTypeList;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
        //获取服务类目
        getProductCategory($rootScope.token).save().$promise.then(function(data) {
          if (!data.error) {
            $scope.productType = data.productType;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
      });

      //显示添加技能
      $scope.SkillModalShow = function() {
        $scope.modal.show();
        if ($scope.skillList) {
          //默认选中第一个
          $scope.skillList.serverType = $scope.serveTypeList[0].id;

          for (x in $scope.MaterialformatSkillList) {
            $scope.MaterialformatSkillList[x].list.forEach(function(item) {
              $scope.skillList.productType[$scope.MaterialformatSkillList[x].id + '-' + item.id] = item
            })
          }
        }
      }

      //删除技能
      $scope.removeSkill = function(serverTypeId, serverTypeNname, product) {
        $scope.MaterialformatSkillList[serverTypeId].list = $scope.MaterialformatSkillList[serverTypeId].list.filter(function(x) {
          return product.id != x.id;
        })
        if (!$scope.MaterialformatSkillList[serverTypeId].list.length) {
          delete $scope.MaterialformatSkillList[serverTypeId]
        }
        $scope.formatSkillListLength = Object.keys($scope.MaterialformatSkillList).length;

        $scope.skillList.productType[serverTypeId + '-' + product.id] = '';
      }

      //关闭 选择技能界面
      $scope.cancelModal = function() {
        $scope.modal.hide();
        $scope.skillList.productType = {};
      }

      //保存技能
      $scope.saveSkill = function() {
        if (!$scope.skillList.productType) {
          alert('请选择产品类别')
        } else {
          $scope.modal.hide();

          $scope.MaterialformatSkillList = {};
          for (x in $scope.skillList.productType) {
            if ($scope.skillList.productType[x]) {
              $scope.serveIdTemp = x.substring(0, x.indexOf('-'));

              $scope.serveTypeList.forEach(function(item) {
                if (item.id == $scope.serveIdTemp) {
                  $scope.serveName = item.name;
                }
              })
              if (!$scope.MaterialformatSkillList[$scope.serveIdTemp]) {
                $scope.MaterialformatSkillList[$scope.serveIdTemp] = {
                  id: $scope.serveIdTemp,
                  name: $scope.serveName,
                  list: [{
                    name: $scope.skillList.productType[x].name,
                    id: $scope.skillList.productType[x].id
                  }]
                }
              } else {
                $scope.MaterialformatSkillList[$scope.serveIdTemp].list.push({
                  name: $scope.skillList.productType[x].name,
                  id: $scope.skillList.productType[x].id
                })
              }
            }
          }
          $scope.formatSkillListLength = Object.keys($scope.MaterialformatSkillList).length;
        }
      }

      // 提交资料
      $scope.submitInfo = function() {
        var userObj = new FormData();

        $scope.engineerSkill = []
        for (x in $scope.MaterialformatSkillList) {
          $scope.MaterialformatSkillList[x].list.forEach(function(item) {
            $scope.engineerSkill.push({
              serverType: {
                id: $scope.MaterialformatSkillList[x].id,
                name: $scope.MaterialformatSkillList[x].name
              },
              productType: item
            })
          })
        }

        $scope.submitFlag = true;

        if ($scope.form.mergencyContactPhone) {
          var reg = /^1(?:3[0-9]|5[0-35-9]|7[6-8]|8[0-9])\d{8}$/;
          if (!reg.test($scope.form.mergencyContactPhone)) {
            alert('请输入正确的手机号');
            return false;
          }
        }

        if ($scope.areaRegion.province && $scope.areaRegion.city && $scope.areaRegion.area && $scope.form.engineerAddress && $scope.form.mergencyContact && $scope.form.mergencyContactPhone && $scope.areaServer.province && $scope.areaServer.city && $scope.areaServer.area && $scope.engineerSkill.length) {

          userObj.append('engineerProvince', $scope.areaRegion.province.id);
          userObj.append('engineerCity', $scope.areaRegion.city.id);
          userObj.append('engineerRegion', $scope.areaRegion.area.id);
          userObj.append('engineerAddress', $scope.form.engineerAddress);
          userObj.append('mergencyContact', $scope.form.mergencyContact);
          userObj.append('mergencyContactPhone', $scope.form.mergencyContactPhone);
          userObj.append('engineerServeProvince', $scope.areaServer.province.id);
          userObj.append('engineerServeCity', $scope.areaServer.city.id);
          userObj.append('engineerServeRegion', $scope.areaServer.area.map(function(item){return item.id}).join(','));
          userObj.append('engineerSkill', JSON.stringify($scope.engineerSkill));

          if ($scope.isAllEdit && $scope.form.engineerName && $scope.form.engineerIdentityNo && $scope.form.sex && $scope.engineerPortrait && $scope.engineerFront && $scope.engineerReverse && $scope.engineerHold) {
            $ionicLoading.show();

            userObj.append('engineerPortrait', $scope.engineerPortrait, 'engineerPortrait.jpg');
            userObj.append('engineerName', $scope.form.engineerName);
            userObj.append('engineerIdentityNo', $scope.form.engineerIdentityNo);
            userObj.append('sex', $scope.form.sex);
            userObj.append('engineerFront', $scope.engineerFront, 'engineerFront.jpg');
            userObj.append('engineerReverse', $scope.engineerReverse, 'engineerReverse.jpg');
            userObj.append('engineerHold', $scope.engineerHold, 'engineerHold.jpg');

            submitBasicInfo($rootScope.token).save(userObj).$promise.then(function(data) {
              if (!data.error) {
                $rootScope.completeMaterSuccess = true;
                $scope.goBack('index');
              } else {
                alert(data.error)
              }
              $ionicLoading.hide();
            }, function(response) {
              $q.reject(response.resultData);
              $ionicLoading.hide();
            });
          } else if (!$scope.isAllEdit) {
            submitBasicInfo($rootScope.token).save(userObj).$promise.then(function(data) {
              if (!data.error) {
                $scope.goBack();
              } else {
                alert(data.error)
              }
              $ionicLoading.hide();
            }, function(response) {
              $q.reject(response.resultData);
              $ionicLoading.hide();
            });
          }
        }
      }
    }
  ])
  .controller('clipImageCtrl', ['$rootScope', '$scope', '$state', '$ionicActionSheet', '$cordovaCamera', '$cordovaImagePicker', '$ionicLoading',
    function($rootScope, $scope, $state, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $ionicLoading) {
      // 调用手势方法
      $.imgGesture({
        opID: 'content',
        imgID: 'img'
      });

      // 裁剪头像
      $scope.chooseUserPhoto = function() {
        var style = $('#img').attr('style');
        $.clipPortrait({
          url: $scope.userImg,
          style: style,
          height: 165,
          callback: function(url) {
            $rootScope.userImg = url;
            $scope.dataURLtoBlob(url, 'engineerPortrait');
            $scope.goBack();
          }
        })
      }
    }
  ])
