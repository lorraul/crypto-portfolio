angular.module('crypto.controllers', ['chart.js'])

.controller('DashCtrl', function($scope, $stateParams, $ionicPlatform, portfolioData, $ionicPopup, admobSvc) {
    $ionicPlatform.ready(function() {
        if (typeof window.analytics !== 'undefined') {
            analytics.trackView("Dash");
        }
        
        if (typeof admob.requestInterstitialAd !== 'undefined') { 
            admob.requestInterstitialAd({
                //publisherId: "ca-app-pub-3940256099942544/1033173712"   ->test id
                publisherId: "ca-app-pub-9078612112781257/5603151265"
            });
        } else {
            console.log("admob not running");
        }
    });

    $scope.portfolioValueUsd = portfolioData.value.usd.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    $scope.portfolioValueBtc = portfolioData.value.btc.toFixed(8).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    $scope.portfolioStructure = portfolioData.structure;
    
    $scope.labels = [];
    $scope.data = [];
    $scope.colours = [];
    $scope.options = { 
        'animation' : false, 
    };
    
    for (i in $scope.portfolioStructure){
        $scope.labels.push($scope.portfolioStructure[i].type);
        $scope.data.push($scope.portfolioStructure[i].percent.toFixed(2));
        $scope.colours.push($scope.portfolioStructure[i].color);
    }
})

.controller('StatsCtrl', function($scope) {
})

.controller('WalletsCtrl', function($scope, $rootScope, $injector, $ionicModal, $ionicPopup, Wallets, walletsWBalances, $cordovaToast, $localStorage) {
    if (typeof window.analytics !== 'undefined') {
        analytics.trackView("Addresses");
    }
    
    if ($rootScope.defaultAddresses) {
        $ionicPopup.alert({
         title: 'No addresses in your portfolio!',
         template: "Three sample addresses were added. You can delete them and add your own at the Addresses tab."
        });
        $rootScope.defaultAddresses = false;
    }
    
    $scope.wallets = walletsWBalances;  
    
    $scope.shouldShowDelete = false;
    $scope.toggleDelete = function () {
                $scope.shouldShowDelete = !$scope.shouldShowDelete;
            }
    $ionicModal.fromTemplateUrl('templates/addwallet.html', { scope: $scope }).then(function(modal) {
        $scope.modal = modal;
    });
    
    $scope.closeAddForm = function() {
        $scope.modal.hide();
    };
    
    $scope.openAddForm = function() {
        $scope.newWalletData = {};
        $scope.modal.show();
    };
    
    $scope.submitAddForm = function() {
        $injector.get('walletData'+$scope.newWalletData.type).balance($scope.newWalletData.address).then(
            function(data){
                if (data == 'error'){
                    var alertPopup = $ionicPopup.alert({
                                      title: 'Invalid address!',
                                      template: $scope.newWalletData.address
                                     });
                    if (typeof window.analytics !== 'undefined') {
                        analytics.trackEvent('Error', 'Invalid Address', $scope.newWalletData.type);
                    }
                    alertPopup.then(function(res) {
                      console.log('invalid address ' + res);
                    });
                }
                else {
                    if(window.cordova){
                        $cordovaToast.show('Adding wallet...', 'long', 'center');
                    } else {
                        if(console){ console.log('cordova is not running'); }
                    }
                    
                    var add = Wallets.addToWallets($scope.newWalletData);
                    
                    if (add == true) {
                        if (typeof window.analytics !== 'undefined') {
                            analytics.trackEvent('Address', 'Add', $scope.newWalletData.type);
                        }
                        $localStorage.remove('balances');
                        $localStorage.remove('prices');
                        data = data.toString();
                        if ( (parseFloat(data) % 1)==0 ) data = data + '.00';
                        $scope.newWalletData.balance = data.replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' ' + $scope.newWalletData.type.toUpperCase();
                        $scope.wallets.push($scope.newWalletData);
                    }
                    else {
                        $ionicPopup.alert({
                                      title: 'Address cannot be added!',
                                      template: $scope.newWalletData.address
                                     });
                    }
                }
            }
        );
        $scope.closeAddForm();
    };
    
    $scope.deleteWallet = function (address) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this address?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                
                //delete from scope to update the view
                for (var i = 0; i < $scope.wallets.length; i++) {
                    if ($scope.wallets[i].address == address) {
                        $scope.wallets.splice(i, 1);
                    }
                }
                
                //delete from local storage
                Wallets.deleteFromWallets(address);
                
                if (typeof window.analytics !== 'undefined') {
                    analytics.trackEvent('Address', 'Delete');
                }
                
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;
     }
})

.controller('WalletDetailCtrl', function($scope, walletData) {
    if (typeof window.analytics !== 'undefined') {
        analytics.trackView("Details");
    }
    $scope.wallet = walletData;
})

.controller('CurrenciesCtrl', function($scope, currencies) {
    if (typeof window.analytics !== 'undefined') {
        analytics.trackView("Currencies");
    }
    $scope.currencies = currencies;
})

.controller('SettingsCtrl', function($scope) {
})

.controller('HelpCtrl', function($scope) {
    if (typeof window.analytics !== 'undefined') {
        analytics.trackView("Help");
    }
});
