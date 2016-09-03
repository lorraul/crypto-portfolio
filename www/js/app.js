angular.module('cryptoapp', ['ionic', 'ngCordova', 'crypto.controllers', 'crypto.services', 'crypto.resources', 'admobModule'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $localStorage, $state, $timeout, admobSvc) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        
        //google analytics
        if (typeof window.analytics !== 'undefined') {
            window.analytics.startTrackerWithId('UA-22178008-1');
            analytics.trackView("Start");
          } else {
            console.log("analytics not running");
        }
        
        // window.Connection empty object in web browser
        if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicLoading.hide();

                    $ionicPopup.alert({
                     title: 'No Internet Connection!',
                     template: "A working internet connection is required by the app."
                    })
                    .then(function(res) {
                        ionic.Platform.exitApp();
                    });
                }
        }
        
        //reset balance and price data on localstorage
        $localStorage.remove('balances');
        $localStorage.remove('prices');
        
        //default wallets for testing
        if ($localStorage.get('wallets','[]')=='[]'){
            var defaultWallets = [];
            defaultWallets.push({label: 'dogewallet', address: 'D8EyEfuNsfQ3root9R3ac54mMcLmoNBW6q', type: 'doge'});
            defaultWallets.push({label: 'bitcoinwallet', address: '12dUggmXPYsPVHaHr1DoW5J6bb6gvh4yZq', type: 'btc'});
            defaultWallets.push({label: 'counterparty', address: '1Co1dcFX6u1wQ8cW8mnj1DEgW7xQMEaChD', type: 'xcp'});
            $localStorage.storeObject('wallets', defaultWallets);
            $rootScope.defaultAddresses = true;
            $state.go('tab.wallets', {}, {reload: true});
        }
        
        if (navigator.splashscreen) {
             navigator.splashscreen.hide();
          } 
    });
    
    $rootScope.refresh = function(){
        $localStorage.remove('balances');
        $localStorage.remove('prices');
        
        if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $timeout( function(){ $ionicLoading.hide()},100);

                    $ionicPopup.alert({
                     title: 'No Internet Connection!',
                     template: "A working internet connection is required by the app."
                    })
                    .then(function(res) {
                        ionic.Platform.exitApp();
                    });
                }
        }
        
        $state.reload();
    };
    
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Loading ...'
        })
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
        //console.log('state loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        //console.log('state change done');
        $rootScope.$broadcast('loading:hide');
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        //alert('state change error ' + error);
        console.log('state change error ' + error);
        $ionicLoading.hide();
    });
})

.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider

    // abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    .state('tab.dash', {
        cache: false,
        url: '/dash',
        views: {
            'pageContent': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl',
                resolve: { 
                    portfolioData: function(portfolioData){ return portfolioData(); }
                }
            }
        }
    })
    
    .state('tab.stats', {
        url: '/stats',
        views: {
            'tab-stats': {
                templateUrl: 'templates/tab-stats.html',
                controller: 'StatsCtrl',
            }
        }
    })

    
    .state('tab.wallets', {
        cache: false,
        url: '/wallets',
        views: {
            'tab-wallets': {
                templateUrl: 'templates/tab-wallets.html',
                controller: 'WalletsCtrl',
                resolve: {
                    walletsWBalances: function(walletsWithBalance){ return walletsWithBalance.all(); },
                }
            }
        }
    })
    
    .state('tab.walletdetail', {
        url: '/wallets/:walletAddress',
        views: {
            'tab-wallets': {
                templateUrl: 'templates/wallet-detail.html',
                controller: 'WalletDetailCtrl',
                resolve: { 
                    walletData: function(walletDetails, $stateParams){ return walletDetails($stateParams.walletAddress); },
                }
            }
        }
    })
    
    .state('tab.currencies', {
        cache: false,
        url: '/currencies',
        views: {
            'tab-currencies': {
                templateUrl: 'templates/tab-currencies.html',
                controller: 'CurrenciesCtrl',
                resolve: {
                    currencies: function(currenciesBalancePrice){ return currenciesBalancePrice(); }
                }
            }
        }
    })

    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'SettingsCtrl'
            }
        }
    })
    
    .state('tab.help', {
        cache: false,
        url: '/help',
        views: {
            'tab-help': {
                templateUrl: 'templates/tab-help.html',
                controller: 'HelpCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('tab/dash');
})

;
