angular.module('mobile.resource.services')
  .constant('SERVER_URL', 'http://221.6.35.90:18080/daojia-protocol/') // 测试机
  // .constant('SERVER_URL', 'http://192.168.1.231:8080/daojia-protocol/') // 楚云
  // .constant('SERVER_URL', 'http://192.168.1.109:8080/daojia-protocol/') // 陈垚
  //.constant('SERVER_URL', 'http://192.168.1.170:8081/daojia-protocol/') // 钱进
  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    pageNotFound: 'page-not-find'
  })
  //getServerTime
  .factory('getServerTime', ['$resource', 'SERVER_URL',
    function ($resource,SERVER_URL) {
      return $resource(SERVER_URL + 'commons/getSystemTime', {},
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])

  //获取短信验证码
  .factory('getRUserSMSCode', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return $resource(SERVER_URL + 'user/appRegisterAuthCode',
        {
          telephone: '@telephone'
        },
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])

  //用户注册
  .factory('registerUser', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return $resource(SERVER_URL + 'user/appRegisterUser',
        {
          userId: '@userId',
          authCode: '@authCode',
          password: '@password',
          repassword: '@repassword'
        },
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])

  //忘记密码 验证码获取
  .factory('getFpswSmsCode', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return $resource(SERVER_URL + 'user/appForgetPswAuthCode',
        {
          telephone: '@telephone'
        },
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])


  //忘记密码  完成
  .factory('resetPassword', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return $resource(SERVER_URL + 'user/appResetPassword',
        {
          telephone: '@telephone',
          code: '@code',
          newPassword: '@newPassword',
          repassword: '@repassword'
        },
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])


  //登录
  .factory('userLogin', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return $resource(SERVER_URL + 'user/appLogin',
        {
          userId: '@userId',
          password: '@password',
          serverPassword: '@serverPassword',
          isRememberPsw: '@isRememberPsw'
        },
        {
          save: {
            method: 'POST',
            timeout: 5000
          }
        }
      );
    }
  ])

  //index
  .factory('index', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/appOfHomePage',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //开启关闭接单功能
  .factory('setServeState', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'engineer/appSetServeState',{
            serveState: '@serveState'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //工单状态
  .factory('orderState', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getWorkOrderStatusList',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //工单列表获取
  .factory('getWorkOrderList', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appWorkOrderListForEngineer',{
            currentNum: '@currentNum',
            state:'@state'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

   //接单
  .factory('acceptOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appAcceptOrder',{
            orderId: '@orderId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //拒单
  .factory('refuseOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appRefuseOrder',{
            orderId: '@orderId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //待接工单  获取今日接单数和自动拒单时间
  .factory('getTDRNumAndRefuseTime', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appTDRNumAndRefuseTime',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //工单详情
  .factory('getWorkOrderDetail', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appWorkOrderDetail',{
            orderId: '@orderId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //工单详情其他信息
  .factory('getWorkOrderDetailOther', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appWorkOrderOtherDetail',{
            orderId: '@orderId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //签到  短信发送验证码
  .factory('signSendSMS', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appSignVoucher',{
            orderId: '@orderId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //验证码 签到提交
  .factory('signSub', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appCompleteSign',{
            orderId: '@orderId',
            code: '@code'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //获取改派原因
  .factory('getRedirectionMsg', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getRedirectionMsg',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

    //改派工单
  .factory('reassignOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appRedirectionOrder',{
            orderId: '@orderId',
            reasonId: '@reasonId',
            reasonText: '@reasonText'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //获取取消原因
  .factory('getCancelReason', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getOrderCancelReasonList',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //取消工单
  .factory('cancelOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appCancelOrder',{
            orderId: '@orderId',
            reasonId: '@reasonId',
            reasonText: '@reasonText'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //获取挂起原因
  .factory('getHangUpReason', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getHangUpReason',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //挂起工单
  .factory('pendOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appHangUpOrder',{
            orderId: '@orderId',
            reasonId: '@reasonId',
            reasonText: '@reasonText'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //提交备忘
  .factory('remarkForOrder', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'engineer/appRemarkForOrder',{
            orderId: '@orderId',
            remark: '@remark'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //消息中心
  .factory('news', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/getMessageList',{
          state: '@state',
          time: '@time',
          currentNum: '@currentNum'
        },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //消息中心  标记为已读
  .factory('markRead', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/setMessageRead',{
            id: '@id'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])


  //个人中心
  .factory('userCenter', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/getCenterInfo',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //修改密码
  .factory('passModify', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/updatePassword',{
            oldPassword: '@oldPassword',
            newPassword: '@newPassword',
            repassword: '@repassword'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //登出
  .factory('accountExit', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/exist',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //服务类别获取
  .factory('getServeType', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getServeTypeList',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //服务类目获取
  .factory('getProductCategory', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getProductCategoryList',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])


  //省市区三级联动
  .factory('getGeoList', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getGeoList',{
            provinceId: '@provinceId',
            cityId: '@cityId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //服务支持地域省市区三级联动
  .factory('getServeGeoList', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'commons/getServiceGeoList',{
            provinceId: '@provinceId',
            cityId: '@cityId'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])


  //完善资料  基本信息编辑
  .factory('submitBasicInfo', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'engineer/updateEngineer',{
            engineerPortrait: '@engineerPortrait',
            engineerName: '@engineerName',
            engineerIdentityNo: '@engineerIdentityNo',
            sex: '@sex',
            engineerProvince: '@engineerProvince',
            engineerCity: '@engineerCity',
            engineerRegion: '@engineerRegion',
            engineerAddress: '@engineerAddress',
            mergencyContact: '@mergencyContact',
            mergencyContactPhone: '@mergencyContactPhone',
            engineerServeProvince: '@engineerServeProvince',
            engineerServeCity: '@engineerServeCity',
            engineerServeRegion: '@engineerServeRegion',
            engineerSkill: '@engineerSkill',
            engineerFront: '@engineerFront',
            engineerReverse: '@engineerReverse',
            engineerHold: '@engineerHold'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                'Authorization': token,
                'Content-Type':undefined,
                'enctype':'multipart/form-data'
              }
            }
          }
        );
      }
    }
  ])

  //个人资料
  .factory('queryEngineerInfo', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'user/queryEngineerInfo',{},
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                Authorization: token
              }
            }
          }
        );
      }
    }
  ])

  //拍照完工
  .factory('finishedWorkOrderByImg', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appCompleteWorkOrder',{
            orderId: '@orderId',
            img1: '@img1',
            img2: '@img2',
            img3: '@img3'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                'Authorization': token,
                'Content-Type':undefined,
                'enctype':'multipart/form-data'
              }
            }
          }
        );
      }
    }
  ])

  // 获取时间段内已预约工单数量
  .factory('getOrderNumForADate', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appOrderNumForADate',{
            appointmentDate: '@appointmentDate'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                'Authorization': token
              }
            }
          }
        );
      }
    }
  ])

  // 更改预约时间
  .factory('setAppointmentDate', ['$resource', 'SERVER_URL',
    function ($resource, SERVER_URL) {
      return function (token) {
        return $resource(SERVER_URL + 'workOrder/appSetAppointmentDate',{
            orderId: '@orderId',
            appointmentDate: '@appointmentDate',
            appointmentTime: '@appointmentTime'
          },
          {
            save: {
              method: 'POST',
              timeout: 5000,
              headers: {
                'Authorization': token
              }
            }
          }
        );
      }
    }
  ])
