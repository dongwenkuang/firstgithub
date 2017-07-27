angular.module('mobile.news.controllers')
  .controller('newsCtrl', ['$rootScope', '$scope', '$q', '$ionicLoading','$state', '$timeout', 'news','markRead',
    function ($rootScope, $scope, $q, $ionicLoading, $state, $timeout, news, markRead) {
      $scope.state = 1; //1 未读  2 已读
      $scope.time= 0;
      $scope.moreData = false;
      $scope.currentNum = 0;

      $scope.showNewsLimitWrp = false; //时间段 选择界面

      $scope.showNewsLimit = function(){
        $scope.showNewsLimitWrp = !$scope.showNewsLimitWrp;
      }

      // 消息中心tab切换
      $scope.toggleType = function (state, index) {
        $scope.state = state;
        $scope.newsData = getData();
        $scope.currentNum = 0
      };

      //获取消息中心数据
      var getData = function(direction,more){
        $ionicLoading.show();
        var newsObj = {
          state: $scope.state.toString(),
          time: $scope.time.toString(),
          currentNum: $scope.currentNum.toString()
        };

        news($rootScope.token).save(newsObj).$promise.then(function(data){
          if (!data.error) {
            $ionicLoading.hide();
            if (more) $scope.newsData.msgList = $scope.newsData.msgList.concat(data.msgList);
            else $scope.newsData = data;

            $scope.newsData.msgList.forEach(function(item){
              item.fisrtMsg = item.msgTemplate.substring(0,item.msgTemplate.indexOf('@@'));
              item.orderId = item.msgTemplate.substring(item.msgTemplate.indexOf('@@')+2,item.msgTemplate.lastIndexOf('@@'));
              item.LastMsg = item.msgTemplate.substring(item.msgTemplate.lastIndexOf('@@')+2, item.msgTemplate.length);
            })

            $scope.currentNum = $scope.newsData.msgList.length;

            if ($scope.newsData.msgList && $scope.newsData.msgList.length < $scope.newsData.msgNum) $scope.moreData = true;
            else $scope.moreData = false;

            if (direction === 'up') $scope.$broadcast("scroll.infiniteScrollComplete");
            if (direction === 'down') $scope.$broadcast('scroll.refreshComplete');

          } else {
            alert(data.error)
          }
          $ionicLoading.hide();
        }, function (response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
      }

      getData();

      // 加载更多
      $scope.loadMoreData = function() {
        $timeout(function () {
          getData('up',true);
        }, 500);
      };

      // 下拉刷新
      $scope.doRefresh = function() {
        $timeout(function() {
          $scope.newsData = getData('down');
        }, 1000);
      };

      //切换查询条件
      $scope.loadNews = function(value){
        $scope.time =  value;
        $scope.showNewsLimitWrp = false;
        getData();
      }

      //标记已读
      $scope.markRead = function(item,index){
        $scope.newsData.msgList.splice(index, 1);

        markRead($rootScope.token).save({id:item.id}).$promise.then(function(data){
          if (!data.error) {
          } else {
            alert(data.error)
          }
        }, function (response) {
          $q.reject(response.resultData);
          $ionicLoading.hide();
        });
      }


      $scope.go = function(item,index){
        $state.go('orderDetail',{orderId:item.orderId})
        if($scope.state == 1){
          $scope.newsData.msgList.splice(index, 1);

          markRead($rootScope.token).save({id:item.id}).$promise.then(function(data){
            if (!data.error) {

            } else {
              alert(data.error)
            }
          }, function (response) {
            $q.reject(response.resultData);
            $ionicLoading.hide();
          });
        }
      }
    }])
