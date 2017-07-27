angular.module('mobile.authentication.services')
    .factory('AuthInterceptor',['$rootScope', '$q', 'AUTH_EVENTS',
        function ($rootScope, $q, AUTH_EVENTS) {
            return {
                responseError: function (response) {
                    $rootScope.$broadcast({
                        401: AUTH_EVENTS.notAuthenticated,
                        403: AUTH_EVENTS.notAuthorized,
                        404: AUTH_EVENTS.pageNotFound
                    }[response.status], response);
                    return $q.reject(response);
                }
            };
        }
    ])
    .config(['$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        }
    ]);
