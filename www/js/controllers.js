angular.module('crypto.controllers', ['chart.js'])

    .controller('DashCtrl', function ($scope, $stateParams, $ionicPlatform, portfolioData, $ionicPopup) {
        $ionicPlatform.ready(function () {
            if (typeof window.analytics !== 'undefined') {
                analytics.trackView("Dash");
            }
        });

        $scope.portfolioValueUsd = portfolioData.value.usd.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        $scope.portfolioValueEur = portfolioData.value.eur.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        $scope.portfolioValueBtc = portfolioData.value.btc.toFixed(8).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        $scope.portfolioStructure = portfolioData.structure;

        $scope.labels = [];
        $scope.data = [];
        $scope.colours = [];
        $scope.options = {
            'animation': false,
        };

        for (var i in $scope.portfolioStructure) {
            $scope.labels.push($scope.portfolioStructure[i].type);
            $scope.data.push($scope.portfolioStructure[i].percent.toFixed(2));
            $scope.colours.push($scope.portfolioStructure[i].color);
        }
    })

    .controller('StatsCtrl', function ($scope) {})

    .controller('WalletsCtrl', function ($scope, $rootScope, $injector, $ionicModal, $ionicPopup, Wallets, Fixed, walletsWBalances, $cordovaToast, $localStorage) {
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
        $scope.fixed = Fixed.getFixed();

        $scope.shouldShowDelete = false;
        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
        };

        //add new address
        $ionicModal.fromTemplateUrl('templates/addwallet.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.closeAddForm = function () {
            $scope.modal.hide();
        };

        $scope.openAddForm = function () {
            $scope.newWalletData = {};
            $scope.modal.show();
        };

        $scope.submitAddForm = function () {
            $injector.get('walletData' + $scope.newWalletData.type).balance($scope.newWalletData.address).then(
                function (data) {
                    if (data == 'error') {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Invalid address!',
                            template: $scope.newWalletData.address
                        });
                        if (typeof window.analytics !== 'undefined') {
                            analytics.trackEvent('Error', 'Invalid Address', $scope.newWalletData.type);
                        }
                        alertPopup.then(function (res) {
                            console.log('invalid address ' + res);
                        });
                    } else {
                        if (window.cordova) {
                            $cordovaToast.show('Adding address...', 'long', 'center');
                        } else {
                            if (console) {
                                console.log('cordova is not running');
                            }
                        }

                        var add = Wallets.addToWallets($scope.newWalletData);

                        if (add === true) {
                            if (typeof window.analytics !== 'undefined') {
                                analytics.trackEvent('Address', 'Add', $scope.newWalletData.type);
                            }
                            $localStorage.remove('balances');
                            $localStorage.remove('prices');
                            data = data.toString();
                            if ((parseFloat(data) % 1) === 0) data = data + '.00';
                            $scope.newWalletData.balance = data.replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' ' + $scope.newWalletData.type.toUpperCase();
                            $scope.wallets.push($scope.newWalletData);
                        } else if (add == 'duplicate') {
                            $ionicPopup.alert({
                                title: 'Address cannot be added!',
                                template: 'Already in portfolio: ' + $scope.newWalletData.address
                            });
                        } else {
                            $ionicPopup.alert({
                                title: 'Address cannot be added!',
                                template: 'Unknown error: ' + $scope.newWalletData.address
                            });
                        }
                    }
                }
            );
            $scope.closeAddForm();
        };

        //add new fixed item
        $ionicModal.fromTemplateUrl('templates/addfixed.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modalFixed = modal;
        });

        $scope.closeFixedForm = function () {
            $scope.modalFixed.hide();
        };

        $scope.openFixedForm = function () {
            $scope.newFixedData = {};
            $scope.modalFixed.show();
        };

        $scope.submitFixedForm = function () {
            if (window.cordova) {
                $cordovaToast.show('Adding new fixed item...', 'long', 'center');
            } else {
                if (console) {
                    console.log('cordova is not running');
                }
            }

            //add new fixed item to local storage
            var add = Fixed.addToFixed($scope.newFixedData);

            //add new fixed item to current view if it is added to local storage
            if (add === true) {
                if (typeof window.analytics !== 'undefined') {
                    analytics.trackEvent('Address', 'Add', 'fixed');
                }

                var newFixedValue = $scope.newFixedData.value.toString();
                if ((parseFloat(newFixedValue) % 1) === 0) newFixedValue = newFixedValue + '.00';
                newFixedValue = newFixedValue.replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' USD';

                $scope.fixed.push({
                    label: $scope.newFixedData.label,
                    value: newFixedValue
                });
            } else if (add == 'duplicate') {
                $ionicPopup.alert({
                    title: 'Fixed item cannot be added!',
                    template: 'Label duplicate: ' + $scope.newFixedData.label
                });
            } else {
                $ionicPopup.alert({
                    title: 'Fixed item cannot be added!',
                    template: 'Unknown error: ' + $scope.newFixedData.label
                });
            }

            $scope.closeFixedForm();
        };

        //delete address
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
        };

        //delete fixed item
        $scope.deleteFixed = function (label) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm Delete',
                template: 'Are you sure you want to delete this fixed item?'
            });

            confirmPopup.then(function (res) {
                if (res) {

                    //delete from scope to update the view
                    for (var i = 0; i < $scope.fixed.length; i++) {
                        if ($scope.fixed[i].label == label) {
                            $scope.fixed.splice(i, 1);
                        }
                    }

                    //delete from local storage
                    Fixed.deleteFromFixed(label);

                    if (typeof window.analytics !== 'undefined') {
                        analytics.trackEvent('Address', 'Delete');
                    }

                } else {
                    console.log('Canceled delete');
                }
            });
            $scope.shouldShowDelete = false;
        };
    })

    .controller('WalletDetailCtrl', function ($scope, walletData) {
        if (typeof window.analytics !== 'undefined') {
            analytics.trackView("Details");
        }
        $scope.wallet = walletData;
    })

    .controller('CurrenciesCtrl', function ($scope, currencies) {
        if (typeof window.analytics !== 'undefined') {
            analytics.trackView("Currencies");
        }
        $scope.currencies = currencies;
    })

    .controller('SettingsCtrl', function ($scope) {})

    .controller('HelpCtrl', function ($scope) {
        if (typeof window.analytics !== 'undefined') {
            analytics.trackView("Help");
        }
    });
