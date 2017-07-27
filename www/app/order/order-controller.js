angular.module('mobile.order.controllers')
  .controller('unfinishedOrderCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicLoading', '$q', 'getWorkOrderList', 'getCancelReason', 'cancelOrder', 'getRedirectionMsg', 'reassignOrder', 'getHangUpReason', 'pendOrder', '$interval', 'signSendSMS', 'signSub', 'getOrderNumForADate', 'setAppointmentDate',
    function($rootScope, $scope, $stateParams, $state, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicLoading, $q, getWorkOrderList, getCancelReason, cancelOrder, getRedirectionMsg, reassignOrder, getHangUpReason, pendOrder, $interval, signSendSMS, signSub, getOrderNumForADate, setAppointmentDate) {

      $scope.showBox = {
        sign: false,
        cancel: false,
        reassign: false,
        pend: false,
        serverTime: false
      };
      $rootScope.orderListData = {};

      $rootScope.orderState.result.forEach(function(item) {
        if (item.id == 'w_o_s_wait_appointment') {
          $scope.w_o_s_wait_appointment = item.name; //待预约
        } else if (item.id == 'w_o_s_wait_sign') {
          $scope.w_o_s_wait_sign = item.name; //待签到
        } else if (item.id == 'w_o_s_wait_complate') {
          $scope.w_o_s_wait_complate = item.name; //待完工
        } else if (item.id == 'w_o_s_hang_up') {
          $scope.w_o_s_hang_up = item.name; //挂起
        }
      })

      $scope.moreData = false;
      $scope.currentNum = 0;
      $scope.state = 'w_o_s_wait_appointment';

      if ($stateParams.tabIndex) $rootScope.tabIndex = parseInt($stateParams.tabIndex);
      else $rootScope.tabIndex = 0;

      $scope.activeTab = function(index, state) {
        $rootScope.tabIndex = index;
        $scope.state = state;
        $scope.currentNum = 0;
        getData();
        $ionicScrollDelegate.scrollTop();
      };

      var getData = function(direction, more) {
        $ionicLoading.show();
        var orderObj = {
          currentNum: $scope.currentNum.toString(),
          state: $scope.state
        }

        getWorkOrderList($rootScope.token).save(orderObj).$promise.then(function(data) {
          if (!data.error) {
            if (more) $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.concat(data.orderList);
            else {
              if($rootScope.orderListData){
                $rootScope.orderListData.orderList = [];
              }
              $rootScope.orderListData = data;
            }

            $scope.currentNum = $rootScope.orderListData.orderList.length;

            if ($rootScope.orderListData.orderList && $rootScope.orderListData.orderList.length < $rootScope.orderListData.orderNum) $scope.moreData = true;
            else $scope.moreData = false;

            //格式化
            $rootScope.orderListData.orderList.forEach(function(item){
              //客户意向时间
              if(item.clientIntentionTime){
                item.clientIntentionTimeFirst = item.clientIntentionTime.substring(0,item.clientIntentionTime.indexOf(' '))
                item.clientIntentionTimeLast = item.clientIntentionTime.substring(item.clientIntentionTime.indexOf(' ')+1, item.clientIntentionTime.length);
              }
              // 签到时间 接单时间
              if(item.stateTime){
                item.stateTimeFirst = item.stateTime.substring(0,item.stateTime.indexOf(' '))
                item.stateTimeLast = item.stateTime.substring(item.stateTime.indexOf(' ')+1, item.stateTime.length);
              }
            })

            if (direction === 'up') $scope.$broadcast("scroll.infiniteScrollComplete");
            if (direction === 'down') $scope.$broadcast('scroll.refreshComplete');
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

      getData();

      $scope.goOrderDetail = function(id) {
        $rootScope.orderDeatail = $rootScope.orderListData.orderList.filter(function(item) {
          return item.orderId == id
        })[0]
        $state.go('orderDetail', {
          orderId: id
        })
      }

      $scope.goMemo = function(id, remark) {
        $rootScope.memo = remark;
        $state.go('memo',{orderId:id})
      }

      // 加载更多
      $scope.loadMoreData = function() {
        $timeout(function() {
          getData('up', true);
        }, 500);
      };

      // 下拉刷新
      $scope.doRefresh = function() {
        $timeout(function() {
          $scope.currentNum = 0;
          $rootScope.orderListData = getData('down');
        }, 1000);
      };

      // 获取日期相关数据
      $scope.currentDay = $scope.getToday();
      $scope.showDay = $scope.currentDay;
      $scope.activeDay = $scope.currentDay.year + '-' + $scope.currentDay.month + '-' + $scope.currentDay.day;
      $scope.weekArr = [];
      $scope.occupyNum = {
        '6:00-8:00': 0,
        '8:00-10:00': 0,
        '10:00-12:00': 0,
        '12:00-14:00': 0,
        '14:00-16:00': 0,
        '16:00-18:00': 0,
        '18:00-20:00': 0,
        '20:00-22:00': 0
      };
      $scope.curIndex = 0;

      var dayArr = $scope.jointDateList($scope.currentDay.month, $scope.currentDay.year);

      dayArr = dayArr.splice(dayArr.indexOf($scope.currentDay.day) - $scope.currentDay.week);

      for (var y = 0; y < dayArr.length;) {
        $scope.weekArr.push(dayArr.splice(y, y + 7));
      }

      // 日期控件打开
      $scope.showServerTime = function(id) {
        $scope.showBox.serverTime = true;
        $scope.appointmentId = id;
        $ionicLoading.show();

        getOrderNumForADate($rootScope.token).save({
          appointmentDate: $scope.formartDate($scope.activeDay)
        }).$promise.then(function(data) {
          if (!data.error) {
            $scope.occupyNum = data;
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }).then(function(response) {
          $q.reject(response);
          $ionicLoading.hide();
        });
      };

      // 选择日期
      $scope.chooseDay = function(day, isOver) {
        if (!isOver) {
          $scope.activeDay = day;
          $scope.timeRange = '';
          $ionicLoading.show();
          getOrderNumForADate($rootScope.token).save({
            appointmentDate: $scope.formartDate($scope.activeDay)
          }).$promise.then(function(data) {
            if (!data.error) {
              $scope.occupyNum = data;
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }).then(function(response) {
            $q.reject(response);
            $ionicLoading.hide();
          });
        }
      };

      // 日期列表向前翻页
      $scope.prevPage = function() {
        if ($scope.curIndex > 0) {
          if ($scope.weekArr[$scope.curIndex].indexOf(1) > -1) {
            if ($scope.showDay.month > 1) $scope.showDay.month--;
            else {
              $scope.showDay.month = 12;
              $scope.showDay.year--;
            }
          }
          $scope.curIndex--;
          $('#date-scroll').css('transform', 'translateX(33.33%)');
          $timeout(function() {
            $('#date-scroll').prepend($('#date-scroll').find('.date-box:last'));
            $('#date-scroll').css('transform', 'translateX(0)');
          }, 100);
        }
      };

      // 日期列表向后翻页
      $scope.nextPage = function() {
        if ($scope.curIndex < $scope.weekArr.length - 1) {
          $scope.curIndex++;
          if ($scope.weekArr[$scope.curIndex].indexOf(1) > -1) {
            if ($scope.showDay.month < 12) $scope.showDay.month++;
            else {
              $scope.showDay.month = 1;
              $scope.showDay.year++;
            }
          }
          $('#date-scroll').css('transform', 'translateX(-33.33%)');
          $timeout(function() {
            $('#date-scroll').append($('#date-scroll').find('.date-box:first'));
            $('#date-scroll').css('transform', 'translateX(0)');
          }, 100);
        }
      };

      $scope.orderAppointment = function() {
        if ($scope.timeRange) {
          var obj = {
            orderId: $scope.appointmentId,
            appointmentDate: $scope.formartDate($scope.activeDay),
            appointmentTime: $scope.timeRange
          }

          if ($scope.occupyNum[$scope.timeRange] > 5) alert('您本时间段内未完工单数已超过5个')

          setAppointmentDate($rootScope.token).save(obj).$promise.then(function(data) {
            if (!data.error) {
              $scope.showBox.serverTime = false;
              if($scope.state === 'w_o_s_wait_sign') { //修改预约时间
                $rootScope.orderListData.orderList.filter(function(item) {
                  return item.orderId == $scope.appointmentId
                })[0].appointmentDate = $scope.formartDate($scope.activeDay)

                $rootScope.orderListData.orderList.filter(function(item) {
                  return item.orderId == $scope.appointmentId
                })[0].appointmentTime = $scope.timeRange
              } else {
                $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
                  return item.orderId != $scope.appointmentId
                })
              }
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }).then(function(response) {
            $q.reject(response);
            $ionicLoading.hide();
          });
        } else {
          alert('请选择时间段')
        }
      };

      // 格式化日期
      $scope.formartDate = function(day) {
        var tempArr = day.split('-');

        if (tempArr[1].length === 1) tempArr[1] = '0' + tempArr[1];
        if (tempArr[2].length === 1) tempArr[2] = '0' + tempArr[2];
        return tempArr.join('-');
      };

      $scope.showSign = function(id) {
          $scope.showBox.sign = !$scope.showBox.sign;
          $scope.signOrderId = id;
      }
        //签到 发送验证码
      $scope.serverTime = '发送验证码';
      var stop;
      $scope.signSendSms = function() {
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

        signSendSMS($rootScope.token).save({
          orderId: $scope.signOrderId
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
      $scope.stopFight = function() {
        if (angular.isDefined(stop)) {
          $interval.cancel(stop);
          stop = undefined;
        }
      };

      //签到 提交
      $scope.submitSign = function() {
        if(!$scope.signCode) {
          alert("请输入验证码");
          return false;
        }
        var signObj = {
          orderId: $scope.signOrderId,
          code: $scope.signCode.toString()
        }

        signSub($rootScope.token).save(signObj).$promise.then(function(data) {
          if (!data.error) {
            $scope.showBox.sign = !$scope.showBox.sign;
            $scope.signCode = '';
            $scope.stopFight();
            $scope.serverTime = '发送验证码';
            $scope.sendSmsFlag = false;
            $scope.sendSmsDisabled = false;

            $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
              return item.orderId != $scope.signOrderId
            })
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
      }

      $scope.hideSignBox = function(){
        $scope.showBox.sign = false;
        $scope.signCode = '';
        $scope.stopFight();
        $scope.serverTime = '发送验证码';
        $scope.sendSmsFlag = false;
        $scope.sendSmsDisabled = false;
      }

      //显示 取消 界面
      $scope.showCancel = function(id) {
        $scope.showBox.cancel = !$scope.showBox.cancel;
        $scope.cancelOrderId = id;

        getCancelReason($rootScope.token).save().$promise.then(function(data) {
          if (!data.error) {
            $scope.cancelReasonList = data;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

      //取消工单 提交
      $scope.cancelReason = {};
      $scope.submitCancel = function() {
        $scope.reasonId = [];
        if ($scope.cancelReason.reasonId) {
          for (x in $scope.cancelReason.reasonId) {
            if ($scope.cancelReason.reasonId[x]) $scope.reasonId.push(x);
          }
        }

        if ($scope.cancelReason.other) {
          $scope.reasonId.push('0');
          $scope.reasonId = $scope.reasonId.join();

          if ($scope.cancelReason.reasonText) $scope.reasonText = $scope.cancelReason.reasonText;
          else {
            alert('请填写其他原因');
            return false;
          }
          var cancelReason = {
            orderId: $scope.cancelOrderId,
            reasonId: $scope.reasonId,
            reasonText: $scope.reasonText
          }
        } else {
          $scope.reasonId = $scope.reasonId.join();
          var cancelReason = {
            orderId: $scope.cancelOrderId,
            reasonId: $scope.reasonId
          }
        }

        if (!$scope.reasonId) alert('请选择取消原因');
        else {
          cancelOrder($rootScope.token).save(cancelReason).$promise.then(function(data) {
            if (!data.error) {
              $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
                return item.orderId != $scope.cancelOrderId
              })
              $scope.showBox.cancel = !$scope.showBox.cancel;
              $scope.cancelReason.reasonId = '';
              $scope.cancelReason.other = '';
              $scope.cancelReason.reasonText = '';
            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
        }
      }

      $scope.hideCancelBox = function(){
        $scope.showBox.cancel = false;
        $scope.cancelReason.reasonId = '';
        $scope.cancelReason.other = '';
        $scope.cancelReason.reasonText = '';
      }

      //显示 改派 界面
      $scope.showReassign = function(id) {
        $scope.showBox.reassign = !$scope.showBox.reassign;
        $scope.reassignOrderId = id;

        getRedirectionMsg($rootScope.token).save().$promise.then(function(data) {
          if (!data.error) {
            $scope.reassignReasonList = data;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

      //改派工单 提交
      $scope.reassignReason = {};
      $scope.submitReassign = function() {
        $scope.reasonId = [];
        if ($scope.reassignReason.reasonId) {
          for (x in $scope.reassignReason.reasonId) {
            if ($scope.reassignReason.reasonId[x]) $scope.reasonId.push(x);
          }
        }

        if ($scope.reassignReason.other) {
          $scope.reasonId.push('0');
          $scope.reasonId = $scope.reasonId.join();

          if ($scope.reassignReason.reasonText) $scope.reasonText = $scope.reassignReason.reasonText;
          else {
            alert('请填写其他原因');
            return false;
          }
          var reassignReason = {
            orderId: $scope.reassignOrderId,
            reasonId: $scope.reasonId,
            reasonText: $scope.reasonText
          }
        } else {
          $scope.reasonId = $scope.reasonId.join();
          var reassignReason = {
            orderId: $scope.reassignOrderId,
            reasonId: $scope.reasonId
          }
        }

        if (!$scope.reasonId) alert('请选择改派原因');
        else {
          reassignOrder($rootScope.token).save(reassignReason).$promise.then(function(data) {
            if (!data.error) {
              $scope.showBox.reassign = !$scope.showBox.reassign;
              $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
                return item.orderId != $scope.reassignOrderId
              })
              $scope.reassignReason.reasonId = '';
              $scope.reassignReason.other = '';
              $scope.reassignReason.reasonText = '';
            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
        }
      }

      $scope.hideReassignBox = function(){
        $scope.showBox.reassign = false;
        $scope.reassignReason.reasonId = '';
        $scope.reassignReason.other = '';
        $scope.reassignReason.reasonText = '';
      }

      //显示 挂起 界面
      $scope.showPend = function(id) {
        $scope.showBox.pend = !$scope.showBox.pend;
        $scope.PendOrderId = id;

        getHangUpReason($rootScope.token).save().$promise.then(function(data) {
          if (!data.error) {
            $scope.pendReasonList = data;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

      //挂起工单 提交
      $scope.pendReason = {};
      $scope.submitPend = function() {
        $scope.reasonId = [];
        if ($scope.pendReason.reasonId) {
          for (x in $scope.pendReason.reasonId) {
            if ($scope.pendReason.reasonId[x]) $scope.reasonId.push(x);
          }
        }

        if ($scope.pendReason.other) {
          $scope.reasonId.push('0');
          $scope.reasonId = $scope.reasonId.join();

          if ($scope.pendReason.reasonText) $scope.reasonText = $scope.pendReason.reasonText;
          else {
            alert('请填写其他原因');
            return false;
          }
          var pendReason = {
            orderId: $scope.PendOrderId,
            reasonId: $scope.reasonId,
            reasonText: $scope.reasonText
          }
        } else {
          $scope.reasonId = $scope.reasonId.join();
          var pendReason = {
            orderId: $scope.PendOrderId,
            reasonId: $scope.reasonId
          }
        }

        if (!$scope.reasonId) alert('请选择挂起原因');
        else {
          pendOrder($rootScope.token).save(pendReason).$promise.then(function(data) {
            if (!data.error) {
              $scope.showBox.pend = !$scope.showBox.pend;
              $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
                return item.orderId != $scope.PendOrderId
              })
              $scope.pendReason.reasonId = '';
              $scope.pendReason.other = '';
              $scope.pendReason.reasonText = '';
            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
        }

      }
      $scope.hidePendBox = function(){
        $scope.showBox.pend = false;
        $scope.pendReason.reasonId = '';
        $scope.pendReason.other = '';
        $scope.pendReason.reasonText = '';
      }

    }
  ])


  .controller('hangupOrderCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicLoading', '$q', 'getWorkOrderList', 'getCancelReason', 'cancelOrder', 'getRedirectionMsg', 'reassignOrder', 'getHangUpReason', 'pendOrder', '$interval', 'signSendSMS', 'signSub', 'getOrderNumForADate', 'setAppointmentDate',
    function($rootScope, $scope, $stateParams, $state, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicLoading, $q, getWorkOrderList, getCancelReason, cancelOrder, getRedirectionMsg, reassignOrder, getHangUpReason, pendOrder, $interval, signSendSMS, signSub, getOrderNumForADate, setAppointmentDate) {
      $rootScope.orderListData = {};

      $scope.moreData = false;
      $scope.currentNum = 0;
      $scope.state = 'w_o_s_hang_up';

      var getData = function(direction, more) {
        $ionicLoading.show();
        var orderObj = {
          currentNum: $scope.currentNum.toString(),
          state: $scope.state
        }

        getWorkOrderList($rootScope.token).save(orderObj).$promise.then(function(data) {
          if (!data.error) {
            if (more) $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.concat(data.orderList);
            else {
              if($rootScope.orderListData){
                $rootScope.orderListData.orderList = [];
              }
              $rootScope.orderListData = data;
            }

            $scope.currentNum = $rootScope.orderListData.orderList.length;

            if ($rootScope.orderListData.orderList && $rootScope.orderListData.orderList.length < $rootScope.orderListData.orderNum) $scope.moreData = true;
            else $scope.moreData = false;

            //格式化
            $rootScope.orderListData.orderList.forEach(function(item){
              //客户意向时间
              if(item.clientIntentionTime){
                item.clientIntentionTimeFirst = item.clientIntentionTime.substring(0,item.clientIntentionTime.indexOf(' '))
                item.clientIntentionTimeLast = item.clientIntentionTime.substring(item.clientIntentionTime.indexOf(' ')+1, item.clientIntentionTime.length);
              }
              // 签到时间 接单时间
              if(item.stateTime){
                item.stateTimeFirst = item.stateTime.substring(0,item.stateTime.indexOf(' '))
                item.stateTimeLast = item.stateTime.substring(item.stateTime.indexOf(' ')+1, item.stateTime.length);
              }
            })

            if (direction === 'up') $scope.$broadcast("scroll.infiniteScrollComplete");
            if (direction === 'down') $scope.$broadcast('scroll.refreshComplete');
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

      getData();

      $scope.goOrderDetail = function(id) {
        $rootScope.orderDeatail = $rootScope.orderListData.orderList.filter(function(item) {
          return item.orderId == id
        })[0]
        $state.go('orderDetail', {
          orderId: id
        })
      }

      $scope.goMemo = function(id, remark) {
        $rootScope.memo = remark;
        $state.go('memo',{orderId:id})
      }

      // 加载更多
      $scope.loadMoreData = function() {
        $timeout(function() {
          getData('up', true);
        }, 500);
      };

      // 下拉刷新
      $scope.doRefresh = function() {
        $timeout(function() {
          $scope.currentNum = 0;
          $rootScope.orderListData = getData('down');
        }, 1000);
      };

    }
  ])

.controller('finishedOrderCtrl', ['$rootScope', '$scope', '$state', '$timeout', '$ionicLoading', '$q', '$ionicScrollDelegate', 'getWorkOrderList',
  function($rootScope, $scope, $state, $timeout, $ionicLoading, $q, $ionicScrollDelegate, getWorkOrderList) {

    $scope.type = 0;
    $scope.currentNum = 0;

    // 完工单查询tab切换
    $scope.toggleType = function(type, state) {
      $scope.type = type;
      $scope.state = state;
      $scope.currentNum = 0;
      getData();
      $ionicScrollDelegate.scrollTop();
    };

    $rootScope.orderListData = {};
    $scope.state = 'w_o_s_has_complate';

    var getData = function(direction, more) {
      $ionicLoading.show();
      var orderObj = {
        currentNum: $scope.currentNum.toString(),
        state: $scope.state
      }

      getWorkOrderList($rootScope.token).save(orderObj).$promise.then(function(data) {
        if (!data.error) {
          $ionicLoading.hide();
          if (more) $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.concat(data.orderList);
          else {
            if($rootScope.orderListData){
              $rootScope.orderListData.orderList = [];
            }
            $rootScope.orderListData = data;
          }

          $scope.currentNum = $rootScope.orderListData.orderList.length;

          if ($rootScope.orderListData.orderList && $rootScope.orderListData.orderList.length < $rootScope.orderListData.orderNum) $scope.moreData = true;
          else $scope.moreData = false;

          //格式化 时间
          $rootScope.orderListData.orderList.forEach(function(item){
            //客户意向时间
            if(item.clientIntentionTime){
              item.clientIntentionTimeFirst = item.clientIntentionTime.substring(0,item.clientIntentionTime.indexOf(' '))
              item.clientIntentionTimeLast = item.clientIntentionTime.substring(item.clientIntentionTime.indexOf(' ')+1, item.clientIntentionTime.length);
            }
            if(item.stateTime){
              item.stateTimeFirst = item.stateTime.substring(0,item.stateTime.indexOf(' '))
              item.stateTimeLast = item.stateTime.substring(item.stateTime.indexOf(' ')+1, item.stateTime.length);
            }
          })

          if (direction === 'up') $scope.$broadcast("scroll.infiniteScrollComplete");
          if (direction === 'down') $scope.$broadcast('scroll.refreshComplete');
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });

    }

    getData();

    $scope.goOrderDetail = function(id) {
      $rootScope.orderDeatail = $rootScope.orderListData.orderList.filter(function(item) {
        return item.orderId == id
      })[0]
      $state.go('orderDetail', {
        orderId: id
      })
    }

    // 加载更多
    $scope.loadMoreData = function() {
      $timeout(function() {
        getData('up', true);
      }, 500);
    };

    // 下拉刷新
    $scope.doRefresh = function() {
      $timeout(function() {
        $scope.currentNum = 0;
        $rootScope.orderListData = getData('down');
      }, 1000);
    };

  }
])

.controller('doOrderCtrl', ['$rootScope', '$scope', '$timeout', '$ionicScrollDelegate', '$state', '$ionicLoading', '$q', 'getWorkOrderList', 'acceptOrder', 'refuseOrder', 'getTDRNumAndRefuseTime',
  function($rootScope, $scope, $timeout, $ionicScrollDelegate, $state, $ionicLoading, $q, getWorkOrderList, acceptOrder, refuseOrder, getTDRNumAndRefuseTime) {

    $scope.moreData = false;
    $scope.currentNum = 0;
    $rootScope.orderListData = {};

    var getData = function(direction, more) {
      $ionicLoading.show();
      var userObj = {
        currentNum: $scope.currentNum.toString(),
        state: 'w_o_s_wait_receive'
      };

      getTDRNumAndRefuseTime($rootScope.token).save({}).$promise.then(function(data) {
        if (!data.error) {
          $rootScope.todayReceiveNum = data.todayReceiveNum;
          $rootScope.autoRefuseTime = data.autoRefuseTime;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });

      //工单列表
      getWorkOrderList($rootScope.token).save(userObj).$promise.then(function(data) {
        if (!data.error) {
          if (more) $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.concat(data.orderList);
          else {
            if($rootScope.orderListData){
              $rootScope.orderListData.orderList = [];
            }
            $rootScope.orderListData = data;
          }

          $scope.currentNum = $rootScope.orderListData.orderList.length;

          if ($rootScope.orderListData.orderList && $rootScope.orderListData.orderList.length < $rootScope.orderListData.orderNum) $scope.moreData = true;
          else $scope.moreData = false;

          if (direction === 'up') $scope.$broadcast("scroll.infiniteScrollComplete");
          if (direction === 'down') $scope.$broadcast('scroll.refreshComplete');
        } else {
          alert(data.error)
        }
        $ionicLoading.hide();
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    // 获取页面数据
    getData();

    // 计算剩余小时
    $scope.countHour = function(obj) {
      var surplusTime,
        hh,
        hh_sur;

        var stateTime1 = obj.stateTime.toString() + ":00";
        var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
        var stateTime = date1.getTime()/1000;
        surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

        if (surplusTime <= 0) {
          refuseOrder($rootScope.token).save({
            orderId: obj.orderId
          }).$promise.then(function(data) {
            if (!data.error) {
              $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item){
                return obj.orderId != item.orderId
              })
            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
          obj.refuseOrder = true;
        }

      hh = parseInt(surplusTime / 60 / 60 / 24, 10) * 24;
      hh_sur = parseInt(surplusTime / 60 / 60 % 24, 10);
      return checkTime(hh + hh_sur);
    }

    // 计算剩余分钟
    $scope.countMinute = function(obj) {
      var surplusTime,
        mm = parseInt(surplusTime / 60 % 60, 10);

      var stateTime1 = obj.stateTime.toString() + ":00";
      var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
      var stateTime = date1.getTime()/1000;
      surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

      mm = parseInt(surplusTime / 60 % 60, 10);
      return checkTime(mm);
    };

    // 计算剩余秒
    $scope.countSecond = function(obj) {
      var surplusTime,
        ss;

      var stateTime1 = obj.stateTime.toString() + ":00";
      var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
      var stateTime = date1.getTime()/1000;
      surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

      ss = parseInt(surplusTime % 60, 10);
      return checkTime(ss);
    };

    // 补全两位时间
    var checkTime = function(i) {
      if (i < 10) {
        i = '0' + i;
      }
      return i;
    };

    // 加载更多
    $scope.loadMoreData = function() {
      $timeout(function() {
        getData('up',true);
      }, 500);
    };

    // 下拉刷新
    $scope.doRefresh = function() {
      $timeout(function() {
        $scope.currentNum = 0;
        $rootScope.orderListData = getData('down');
      }, 1000);
    };

    $scope.goOrderDetail = function(id) {
      $rootScope.orderDeatail = $rootScope.orderListData.orderList.filter(function(item) {
        return item.orderId == id
      })[0]

      //格式化 时间
      if($rootScope.orderDeatail.clientIntentionTime){
        $rootScope.orderDeatail.clientIntentionTimeFirst = $rootScope.orderDeatail.clientIntentionTime.substring(0,$rootScope.orderDeatail.clientIntentionTime.indexOf(' '))
        $rootScope.orderDeatail.clientIntentionTimeLast = $rootScope.orderDeatail.clientIntentionTime.substring($rootScope.orderDeatail.clientIntentionTime.indexOf(' ')+1, $rootScope.orderDeatail.clientIntentionTime.length);
      }

      $state.go('orderDetail', {
        orderId: id
      })
    }

    //接单
    $scope.acceptOrder = function(item,index) {
      acceptOrder($rootScope.token).save({
        orderId: item.orderId
      }).$promise.then(function(data) {
        if (!data.error) {
          $rootScope.orderListData.orderList.splice(index, 1);
          $rootScope.todayReceiveNum = $rootScope.todayReceiveNum + 1;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    //拒单
    $scope.refuseOrder = function(item,index) {
      refuseOrder($rootScope.token).save({
        orderId: item.orderId
      }).$promise.then(function(data) {
        if (!data.error) {
          $rootScope.orderListData.orderList.splice(index, 1);
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }
  }
])

.controller('orderDeatailCtrl', ['$rootScope', '$scope', '$state', '$stateParams','$timeout', '$ionicHistory', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicLoading', '$q', 'getWorkOrderDetail', 'getWorkOrderDetailOther', 'acceptOrder', 'refuseOrder', 'getCancelReason', 'cancelOrder', 'getRedirectionMsg', 'reassignOrder', 'getHangUpReason', 'pendOrder', '$interval', 'signSendSMS', 'signSub','getOrderNumForADate','setAppointmentDate',
  function($rootScope, $scope, $state, $stateParams, $timeout, $ionicHistory, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicLoading, $q, getWorkOrderDetail, getWorkOrderDetailOther, acceptOrder, refuseOrder, getCancelReason, cancelOrder, getRedirectionMsg, reassignOrder, getHangUpReason, pendOrder, $interval, signSendSMS, signSub,getOrderNumForADate,setAppointmentDate) {

    $scope.orderId = $stateParams.orderId;
    $scope.isShowSchedule = true;
    $scope.showBox = {
      sign: false,
      cancel: false,
      reassign: false,
      pend: false,
      serverTime: false
    };

    var getDataDetail = function(){
      getWorkOrderDetail($rootScope.token).save({
        orderId: $stateParams.orderId
      }).$promise.then(function(data) {
          if (!data.error) {
            $scope.orderDeatail = data;
            //格式化 时间
            if($scope.orderDeatail.clientIntentionTime){
              $scope.orderDeatail.clientIntentionTimeFirst = $scope.orderDeatail.clientIntentionTime.substring(0,$scope.orderDeatail.clientIntentionTime.indexOf(' '))
              $scope.orderDeatail.clientIntentionTimeLast = $scope.orderDeatail.clientIntentionTime.substring($scope.orderDeatail.clientIntentionTime.indexOf(' ')+1, $scope.orderDeatail.clientIntentionTime.length);
            }

          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
    }

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, from, fromParams) {
      if (from.name === 'completeOrder' && next.name === 'orderDetail' && $rootScope.submitCompleteOrder) {
        getDataDetail();//拍照完工返回 并提交成功时  调用接口
        $rootScope.submitCompleteOrder = false;
      }
    })
    if (!$rootScope.orderDeatail) getDataDetail(); //消息中心进入时  调用接口



    //工单详情 其他信息
    var getData = function() {
      getWorkOrderDetailOther($rootScope.token).save({
        orderId: $stateParams.orderId
      }).$promise.then(function(data) {
        if (!data.error) {
          $scope.orderDeatailOther = data;

          $rootScope.orderState.result.forEach(function(item) {
            if (item.name == $scope.orderDeatail.orderState) {
              $scope.curOrderStateId = item.id;
            }
          })
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    getData();

    $scope.goMemo = function(id, remark) {
      if($scope.curOrderStateId == 'w_o_s_has_cancel' || $scope.curOrderStateId == 'w_o_s_has_complate') return false; //已取消 已完工 不跳转
      $rootScope.memo = remark;
      $state.go('memo',{orderId:id})
    }

    // 计算剩余小时
    $scope.countHour = function() {
      var surplusTime,
        hh,
        hh_sur;

      if($rootScope.orderDeatail){
        var stateTime1 = $rootScope.orderDeatail.stateTime.toString() + ":00";
        var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
        var stateTime = date1.getTime()/1000;
        surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

        if (surplusTime <= 0) {
          refuseOrder($rootScope.token).save({
            orderId: obj.orderId
          }).$promise.then(function(data) {
            if (!data.error) {
              $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item){
                return obj.orderId != item.orderId
              })
            } else {
              alert(data.error)
            }
          }, function(response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
            return;
          });
          obj.refuseOrder = true;
        }
        hh = parseInt(surplusTime / 60 / 60 / 24, 10) * 24;
        hh_sur = parseInt(surplusTime / 60 / 60 % 24, 10);
        return checkTime(hh + hh_sur);
      }
    }

    // 计算剩余分钟
    $scope.countMinute = function(obj) {
      var surplusTime,
        mm = parseInt(surplusTime / 60 % 60, 10);

      if($rootScope.orderDeatail){
        var stateTime1 = $rootScope.orderDeatail.stateTime.toString() + ":00";
        var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
        var stateTime = date1.getTime()/1000;
        surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

        mm = parseInt(surplusTime / 60 % 60, 10);
        return checkTime(mm);
      }
    };

    // 计算剩余秒
    $scope.countSecond = function(obj) {
      var surplusTime,
        ss;

      if($rootScope.orderDeatail){
        var stateTime1 = $rootScope.orderDeatail.stateTime.toString() + ":00";
        var date1 = new Date(Date.parse(stateTime1.replace(/-/g, "/")));
        var stateTime = date1.getTime()/1000;
        surplusTime = stateTime+$rootScope.autoRefuseTime - $rootScope.serverTime;

        ss = parseInt(surplusTime % 60, 10);
        return checkTime(ss);
      }
    };

    // 补全两位时间
    var checkTime = function(i) {
      if (i < 10) {
        i = '0' + i;
      }
      return i;
    };

    //接单
    $scope.acceptOrder = function() {
      acceptOrder($rootScope.token).save({
        orderId: $scope.orderId
      }).$promise.then(function(data) {
        if (!data.error) {
          getData();
          getDataDetail();
          $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
            return item.orderId != $scope.orderId
          })
          $rootScope.todayReceiveNum = $rootScope.todayReceiveNum + 1;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    //拒单
    $scope.refuseOrder = function() {
      refuseOrder($rootScope.token).save({
        orderId: $scope.orderId
      }).$promise.then(function(data) {
        if (!data.error) {
          $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
            return item.orderId != $scope.orderId
          })
          $scope.goBack();
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    // 获取日期相关数据
    $scope.currentDay = $scope.getToday();
    $scope.showDay = $scope.currentDay;
    $scope.activeDay = $scope.currentDay.year + '-' + $scope.currentDay.month + '-' + $scope.currentDay.day;
    $scope.weekArr = [];
    $scope.occupyNum = {
      '6:00-8:00': 0,
      '8:00-10:00': 0,
      '10:00-12:00': 0,
      '12:00-14:00': 0,
      '14:00-16:00': 0,
      '16:00-18:00': 0,
      '18:00-20:00': 0,
      '20:00-22:00': 0
    };
    $scope.curIndex = 0;

    var dayArr = $scope.jointDateList($scope.currentDay.month, $scope.currentDay.year);

    dayArr = dayArr.splice(dayArr.indexOf($scope.currentDay.day) - $scope.currentDay.week);

    for (var y = 0; y < dayArr.length;) {
      $scope.weekArr.push(dayArr.splice(y, y + 7));
    }

    // 日期控件打开
    $scope.showServerTime = function() {
      $scope.showBox.serverTime = true;
      $ionicLoading.show();

      getOrderNumForADate($rootScope.token).save({
        appointmentDate: $scope.formartDate($scope.activeDay)
      }).$promise.then(function(data) {
          if (!data.error) {
            $scope.occupyNum = data;
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }).then(function(response) {
          $q.reject(response);
          $ionicLoading.hide();
        });
    };

    // 选择日期
    $scope.chooseDay = function(day, isOver) {
      if (!isOver) {
        $scope.activeDay = day;
        $scope.timeRange = '';
        $ionicLoading.show();
        getOrderNumForADate($rootScope.token).save({
          appointmentDate: $scope.formartDate($scope.activeDay)
        }).$promise.then(function(data) {
            if (!data.error) {
              $scope.occupyNum = data;
            } else {
              alert(data.error)
            }
            $ionicLoading.hide();
          }).then(function(response) {
            $q.reject(response);
            $ionicLoading.hide();
          });
      }
    };

    // 日期列表向前翻页
    $scope.prevPage = function() {
      if ($scope.curIndex > 0) {
        if ($scope.weekArr[$scope.curIndex].indexOf(1) > -1) {
          if ($scope.showDay.month > 1) $scope.showDay.month--;
          else {
            $scope.showDay.month = 12;
            $scope.showDay.year--;
          }
        }
        $scope.curIndex--;
        $('#date-scroll-detail').css('transform', 'translateX(33.33%)');
        $timeout(function() {
          $('#date-scroll-detail').prepend($('#date-scroll-detail').find('.date-box:last'));
          $('#date-scroll-detail').css('transform', 'translateX(0)');
        }, 100);
      }
    };

    // 日期列表向后翻页
    $scope.nextPage = function() {
      if ($scope.curIndex < $scope.weekArr.length - 1) {
        $scope.curIndex++;
        if ($scope.weekArr[$scope.curIndex].indexOf(1) > -1) {
          if ($scope.showDay.month < 12) $scope.showDay.month++;
          else {
            $scope.showDay.month = 1;
            $scope.showDay.year++;
          }
        }
        $('#date-scroll-detail').css('transform', 'translateX(-33.33%)');
        $timeout(function() {
          $('#date-scroll-detail').append($('#date-scroll-detail').find('.date-box:first'));
          $('#date-scroll-detail').css('transform', 'translateX(0)');
        }, 100);
      }
    };

    $scope.orderAppointment = function() {
      if ($scope.timeRange) {
        var obj = {
          orderId: $scope.orderId,
          appointmentDate: $scope.formartDate($scope.activeDay),
          appointmentTime: $scope.timeRange
        }

        if ($scope.occupyNum[$scope.timeRange] > 5) alert('您本时间段内未完工单数已超过5个')
        setAppointmentDate($rootScope.token).save(obj).$promise.then(function(data) {
          if (!data.error) {
            getData();
            getDataDetail();
            $scope.showBox.serverTime = false;
          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }).then(function(response) {
          $q.reject(response);
          $ionicLoading.hide();
        });
      } else {
        alert('请选择时间段')
      }
    };

    // 格式化日期
    $scope.formartDate = function(day) {
      var tempArr = day.split('-');

      if (tempArr[1].length === 1) tempArr[1] = '0' + tempArr[1];
      if (tempArr[2].length === 1) tempArr[2] = '0' + tempArr[2];
      return tempArr.join('-');
    };
    //签到 发送验证码
    $scope.serverTime = '发送验证码';
    var stop;
    $scope.signSendSms = function() {
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

      signSendSMS($rootScope.token).save({
        orderId: $stateParams.orderId
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
    $scope.stopFight = function() {
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.submitSign = function() {
      if(!$scope.signCode) alert('请输入验证码')
      else{
        var signObj = {
          orderId: $stateParams.orderId,
          code: $scope.signCode.toString()
        }
        $ionicLoading.show();
        signSub($rootScope.token).save(signObj).$promise.then(function(data) {
          if (!data.error) {
            getData();
            getDataDetail();
            $scope.showBox.sign = false;
            $scope.signCode = '';
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

    //显示 取消 界面
    $scope.showCancel = function() {
      $scope.showBox.cancel = !$scope.showBox.cancel;

      getCancelReason($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
          $scope.cancelReasonList = data;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    //取消工单 提交
    $scope.cancelReason = {};
    $scope.submitCancel = function() {
      $scope.reasonId = [];
      if ($scope.cancelReason.reasonId) {
        for (x in $scope.cancelReason.reasonId) {
          if ($scope.cancelReason.reasonId[x]) $scope.reasonId.push(x);
        }
      }

      if ($scope.cancelReason.other) {
        $scope.reasonId.push('0');
        $scope.reasonId = $scope.reasonId.join();

        if ($scope.cancelReason.reasonText) $scope.reasonText = $scope.cancelReason.reasonText;
        else {
          alert('请填写其他原因');
          return false;
        }
        var cancelReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId,
          reasonText: $scope.reasonText
        }
      } else {
        $scope.reasonId = $scope.reasonId.join();
        var cancelReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId
        }
      }

      if (!$scope.reasonId) alert('请选择取消原因');
      else {
        cancelOrder($rootScope.token).save(cancelReason).$promise.then(function(data) {
          if (!data.error) {
            $scope.showBox.cancel = false;
            $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
              return item.orderId != $scope.orderId;
            })
            $scope.goBack();
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

    }

    //显示 改派 界面
    $scope.showReassign = function() {
      $scope.showBox.reassign = !$scope.showBox.reassign;

      getRedirectionMsg($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
          $scope.reassignReasonList = data;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    //改派工单 提交
    $scope.reassignReason = {};
    $scope.submitReassign = function() {
      $scope.reasonId = [];
      if ($scope.reassignReason.reasonId) {
        for (x in $scope.reassignReason.reasonId) {
          if ($scope.reassignReason.reasonId[x]) $scope.reasonId.push(x);
        }
      }

      if ($scope.reassignReason.other) {
        $scope.reasonId.push('0');
        $scope.reasonId = $scope.reasonId.join();

        if ($scope.reassignReason.reasonText) $scope.reasonText = $scope.reassignReason.reasonText;
        else {
          alert('请填写其他原因');
          return false;
        }
        var reassignReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId,
          reasonText: $scope.reasonText
        }
      } else {
        $scope.reasonId = $scope.reasonId.join();
        var reassignReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId
        }
      }

      if (!$scope.reasonId) alert('请选择改派原因');
      else {
        reassignOrder($rootScope.token).save(reassignReason).$promise.then(function(data) {
          if (!data.error) {
            $scope.showBox.reassign = false;
            $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
              return item.orderId != $scope.orderId;
            })
            $scope.goBack();
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }
    }

    //显示 挂起 界面
    $scope.showPend = function() {
      $scope.showBox.pend = !$scope.showBox.pend;

      getHangUpReason($rootScope.token).save().$promise.then(function(data) {
        if (!data.error) {
          $scope.pendReasonList = data;
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

    //挂起工单 提交
    $scope.pendReason = {};
    $scope.submitPend = function() {
      $scope.reasonId = [];
      if ($scope.pendReason.reasonId) {
        for (x in $scope.pendReason.reasonId) {
          if ($scope.pendReason.reasonId[x]) $scope.reasonId.push(x);
        }
      }

      if ($scope.pendReason.other) {
        $scope.reasonId.push('0');
        $scope.reasonId = $scope.reasonId.join();

        if ($scope.pendReason.reasonText) $scope.reasonText = $scope.pendReason.reasonText;
        else {
          alert('请填写其他原因');
          return false;
        }
        var pendReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId,
          reasonText: $scope.reasonText
        }
      } else {
        $scope.reasonId = $scope.reasonId.join();
        var pendReason = {
          orderId: $stateParams.orderId,
          reasonId: $scope.reasonId
        }
      }

      if (!$scope.reasonId) alert('请选择挂起原因');
      else {
        pendOrder($rootScope.token).save(pendReason).$promise.then(function(data) {
          if (!data.error) {
            getData();
            getDataDetail();
            $scope.showBox.pend = false;
          } else {
            alert(data.error)
          }
        }, function(response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
          return;
        });
      }

    }

    //工单进度是否隐藏
    $scope.showSchedule = function() {
      $scope.isShowSchedule = !$scope.isShowSchedule;
      $ionicScrollDelegate.scrollBottom()
    }

  }
])

.controller('memoCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicHistory', '$ionicLoading', '$q', 'remarkForOrder',
  function($rootScope, $scope, $state, $stateParams, $ionicHistory, $ionicLoading, $q, remarkForOrder) {
    $scope.memo = {}
    $scope.memo.content = $rootScope.memo;

    // 清空备忘
    $scope.cleanMemo = function(x) {
      $scope.memo.content = '';
    };

    $scope.saveMemo = function() {
      var memoObj = {
        orderId: $stateParams.orderId,
        remark: $scope.memo.content
      }

      remarkForOrder($rootScope.token).save(memoObj).$promise.then(function(data) {
        if (!data.error) {
          $rootScope.orderListData.orderList.filter(function(item) {
            return item.orderId == $stateParams.orderId;
          })[0].remark = $scope.memo.content;
          $scope.goBack();
        } else {
          alert(data.error)
        }
      }, function(response) {
        $q.reject(response.resultData);
        $ionicLoading.hide();
        return;
      });
    }

  }
])


//拍照完工
.controller('completeOrderCtrl', ['$rootScope', '$scope', '$stateParams','$ionicHistory', '$ionicActionSheet', '$cordovaCamera', '$cordovaImagePicker', '$ionicLoading', '$q', 'finishedWorkOrderByImg',
  function($rootScope, $scope, $stateParams,$ionicHistory, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $ionicLoading, $q, finishedWorkOrderByImg) {

    $scope.maxPhotos = 3;
    $scope.completeOrderImages = [];

    $scope.completeOrder = function() {
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
              quality: 100, //相片质量0-100
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
              $scope.completeOrderImages.push({
                fastSrc: imageData
              });
              var x = $scope.completeOrderImages.length;
              $scope.dataURLtoBlob(imageData, 'img' + x);
            }, function(err) {
              // error
              //CommonJs.AlertPopup(err.message);
            });
          } else if (index == 1) {
            type = 'gallery';
            var options = {
              maximumImagesCount: 3 - $scope.completeOrderImages.length,
              width: 1200,
              height: 1200,
              quality: 100
            };

            $cordovaImagePicker.getPictures(options)
              .then(function(results) {
                for (var i = 0; i < results.length; i++) {
                  $scope.completeOrderImages.push({
                    fastSrc: results[i]
                  });
                  var x = $scope.completeOrderImages.length;
                  var name = 'img' + x;
                  $scope.dataURLtoBlob(results[i], 'img' + x);
                }
              }, function(error) {
                // error getting photos
              });
          }
          return true;
        }
      })
    }


    $scope.deleteImages = function(index) {
      var x = index + 1;
      var name = 'img' + x;
      $rootScope[name] = '';
      $scope.completeOrderImages.splice(index, 1);
    }

    $scope.submit = function() {
      var userObj = new FormData();
      userObj.append('orderId', $stateParams.orderId);

      if ($scope.completeOrderImages.length > 0) {
        for (var i = 0; i < $scope.completeOrderImages.length; i++) {
          var x = i + 1;
          var name = 'img' + x;
          userObj.append('img' + x, $scope[name], 'img'+x+'.jpg');
        }


        $ionicLoading.show();
        finishedWorkOrderByImg($rootScope.token).save(userObj).$promise.then(function(data) {
         if (!data.error) {
           $rootScope.orderListData.orderList = $rootScope.orderListData.orderList.filter(function(item) {
             return item.orderId != $stateParams.orderId
           })
           $rootScope.submitCompleteOrder = true;
           if($ionicHistory.backView().stateId === 'unfinishedOrder'){
             $scope.goBack();
           } else {
             $scope.goBack(-2);
           }
         } else {
           alert(data.error)
         }
         $ionicLoading.hide();
        }, function(response) {
         $q.reject(response.resultData);
         $ionicLoading.hide();
         return;
        });

      } else {
        alert('请选择需要提交的完工图')
        $ionicLoading.hide();
      }
    }

  }
])
