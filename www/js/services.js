angular.module('crypto.services', ['ngResource'])

    .factory('$localStorage', ['$window', function ($window) {
        return {
            store: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            storeObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            check: function (key) {
                if ($window.localStorage[key]) return true;
                else return false;
            }
        };
    }])

    .factory('Fixed', function ($localStorage) {
        var returnFunctions = {};
        var fixedItems = $localStorage.getObject('fixed', '[]');

        returnFunctions.addToFixed = function (fixeddata) {
            for (var i = 0; i < fixedItems.length; i++) {
                if (fixedItems[i].label == fixeddata.label) {
                    return 'duplicate';
                }
            }
            fixedItems.push(fixeddata);
            $localStorage.storeObject('fixed', fixedItems);
            return true;
        };

        returnFunctions.deleteFromFixed = function (label) {
            for (var i = 0; i < fixedItems.length; i++) {
                if (fixedItems[i].label == label) {
                    fixedItems.splice(i, 1);
                    $localStorage.storeObject('fixed', fixedItems);
                    return true;
                }
            }
            return false;
        };

        returnFunctions.getFixed = function (fixeddata) {
            fixedItems = $localStorage.getObject('fixed', '[]'); //reread fixed items for subsequent services
            var fixedValueString, returnArray = [];
            for (var i in fixedItems) {
                fixedValueString = fixedItems[i].value.toString();
                if ((parseFloat(fixedValueString) % 1) === 0) fixedValueString = fixedValueString + '.00';
                fixedValueString = fixedValueString.replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' USD';
                returnArray.push({
                    label: fixedItems[i].label,
                    value: fixedValueString,
                    valueFloat: parseFloat(fixedItems[i].value),
                });
            }
            return returnArray;
        };

        return returnFunctions;
    })

    .factory('Wallets', function ($localStorage) {
        var returnFunctions = {};
        var wallets = $localStorage.getObject('wallets', '[]');

        returnFunctions.addToWallets = function (walletdata) {
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].address == walletdata.address) {
                    return 'duplicate';
                }
            }
            wallets.push(walletdata);
            $localStorage.storeObject('wallets', wallets);
            return true;
        };

        returnFunctions.deleteFromWallets = function (address) {
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].address == address) {
                    wallets.splice(i, 1);
                    $localStorage.storeObject('wallets', wallets);
                    return true;
                }
            }
            return false;
        };

        returnFunctions.getWallets = function () {
            wallets = $localStorage.getObject('wallets', '[]'); //reread wallets for subsequent services
            return wallets;
        };

        returnFunctions.getSingleWallet = function (address) {
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].address == address) {
                    return wallets[i];
                }
            }
            return 'wallet not found in your portfolio';
        };

        return returnFunctions;
    })

    .factory('Balances', function ($localStorage, $injector, $q, $window, $ionicPopup) {
        var returnFunctions = {};

        var balancesApi = function (wallets) {
            var promises = [];
            var apiErrors = [];
            var deferred = $q.defer();
            promises = wallets.map(function (wallet) {
                var walletData = $injector.get('walletData' + wallet.type);
                var balance = walletData.balance(wallet.address)
                    .then(function (response) {
                        if (response == 'error' || response === undefined || response == 'NaN') {
                            apiErrors.push(wallet.type);
                            response = '0';
                            if (typeof window.analytics !== 'undefined') {
                                analytics.trackEvent('Error', 'Api Response', wallet.type);
                            }
                        }
                        //handling int balances for correct formatting
                        if ((parseFloat(response) % 1) === 0) response = response + '.00';

                        if (typeof window.analytics !== 'undefined') {
                            analytics.trackEvent('Address', 'Load', wallet.type);
                        }

                        return {
                            address: wallet.address,
                            type: wallet.type,
                            balance: response.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' ' + wallet.type.toUpperCase(),
                            balanceFloat: parseFloat(response)
                        };
                    });
                return balance;
            });
            $q.all(promises).then(function (results) {
                $localStorage.storeObject('balances', results);
                deferred.resolve(results);
                for (var i in apiErrors) {
                    if (window.Connection) {
                        if (navigator.connection.type == Connection.NONE) break;
                    }
                    $ionicPopup.alert({
                        title: apiErrors[i].toUpperCase() + 'API error!',
                        template: 'App will continue without ' + apiErrors[i].toUpperCase() + ' balance. Try to refresh at the top right. If error is persistent, check for updates.'
                    });
                }
            });

            return deferred.promise;
        };

        var balancesLocal = function () {
            return $localStorage.getObject('balances', '[]');
        };

        returnFunctions.getBalances = function () {
            if (!$localStorage.check('balances')) {
                var wallets = $localStorage.getObject('wallets', '[]');
                return balancesApi(wallets);
            } else {
                return $q.when(balancesLocal()).then(function (result) {
                    return result;
                });
            }
        };

        returnFunctions.addToBalances = function (balancedata) {
            var balances = balancesLocal();
            console.log(balances);
            for (var i = 0; i < balances.length; i++) {
                if (balances[i].address == balancedata.address) {
                    return 'Wallet already in balances.';
                }
            }
            balances.push(balancedata);
            $localStorage.storeObject('balances', balances);
        };

        return returnFunctions;
    })

    .factory('Prices', function ($localStorage, $injector, $q, $ionicPopup) {
        var returnFunctions = {};

        var pricesApi = function (wallets) {

            var currencies = [];
            var currencyFound;
            var apiErrors = [];

            //adding btc by default for fixed items
            currencies.push('btc');

            for (var i in wallets) {
                currencyFound = false;
                for (var j in currencies) {
                    if (currencies[j] == wallets[i].type) {
                        currencyFound = true;
                        break;
                    }
                }
                if (!currencyFound) {
                    currencies.push(wallets[i].type);
                }
            }

            var promises = [];
            var deferred = $q.defer();
            promises = currencies.map(function (currency) {
                var currencyData = $injector.get('currencyData' + currency);
                var price = currencyData.all()
                    .then(function (response) {
                            if (response.price == 'error' || response.price === undefined || response.price == 'NaN') {
                                apiErrors.push(currency);
                                response.price = {
                                    usd: 0,
                                    eur: 0,
                                    btc: 0
                                };
                            }
                            return {
                                type: currency,
                                priceusd: parseFloat(response.price.usd),
                                priceeur: parseFloat(response.price.eur),
                                pricebtc: parseFloat(response.price.btc),
                                time: new Date().toISOString(),
                                color: response.color
                            };
                        },
                        function (error) {
                            return {
                                type: currency,
                                priceusd: error,
                                pricebtc: error,
                                time: new Date().toISOString(),
                                color: '#ff0000'
                            };
                        }
                    );
                return price;
            });
            $q.all(promises).then(function (results) {
                addEurTypeToResults(results);
                $localStorage.storeObject('prices', results);
                deferred.resolve(results);
                for (i in apiErrors) {
                    $ionicPopup.alert({
                        title: apiErrors[i].toUpperCase() + ' price API error!',
                        template: 'App will continue without ' + apiErrors[i].toUpperCase() + ' price. If error is persistent, check for updates.'
                    });
                }

                //get eur/usd based on btc prices
                function addEurTypeToResults(results) {
                    var btcPrices = _.find(results, {
                        type: 'btc'
                    });
                    results.push({
                        type: 'eur',
                        pricebtc: 1 / btcPrices.priceeur,
                        priceeur: 1,
                        priceusd: btcPrices.priceusd / btcPrices.priceeur
                    });
                }
            });

            return deferred.promise;
        };

        var pricesLocal = function () {
            return $localStorage.getObject('prices', '[]');
        };

        returnFunctions.getPrices = function () {
            if (!$localStorage.check('prices')) {
                var wallets = $localStorage.getObject('wallets', '[]');
                return pricesApi(wallets);
            } else {
                return $q.when(pricesLocal()).then(function (result) {
                    return result;
                });
            }
        };

        return returnFunctions;
    })

    .factory('walletsWithBalance', ['Wallets', 'Balances', function (Wallets, Balances) {
        return {
            all: function () {
                var wallets = Wallets.getWallets();
                var returnArray = [];
                var balanceString, balanceFloat;
                return Balances.getBalances().then(function (balances) {
                    for (var i in wallets) {
                        var balanceString,
                            balanceFloat = null;
                        for (var j in balances) {
                            if (balances[j].address == wallets[i].address) {
                                balanceString = balances[j].balance;
                                balanceFloat = balances[j].balanceFloat;
                                break;
                            }
                        }
                        if (balanceString === '') {
                            balanceString = 'no data';
                            balanceFloat = 0;
                        }
                        returnArray.push({
                            label: wallets[i].label,
                            address: wallets[i].address,
                            type: wallets[i].type,
                            balance: balanceString,
                            balanceFloat: balanceFloat
                        });
                    }
                    return returnArray;
                });
            },
            single: function (address) {
                var wallet = Wallets.getSingleWallet(address);
                var returnValue;
                return Balances.getBalances().then(
                    function (balances) {
                        for (var i in balances) {
                            if (balances[i].address == address) {
                                returnValue = {
                                    label: wallet.label,
                                    address: wallet.address,
                                    type: wallet.type,
                                    balance: balances[i].balance.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                                    balanceFloat: balances[i].balanceFloat
                                };
                                break;
                            }
                        }
                        return returnValue;
                    },
                    function (error) {
                        return {
                            label: wallet.label,
                            address: wallet.address,
                            type: wallet.type,
                            balance: error,
                            balanceFloat: error
                        };
                    }
                );
            }
        };
    }])

    .factory('currenciesWithPrices', ['Prices', function (Prices) {
        return {
            all: function () {
                return Prices.getPrices().then(function (prices) {
                    return prices;
                });
            },
            single: function (type) {
                return Prices.getPrices().then(function (prices) {
                    for (var i in prices) {
                        if (prices[i].type == type) {
                            return prices[i];
                        }
                    }
                    console.log('Currency type not recognized!');
                    return 'error';
                });
            }
        };
    }])

    .factory('walletDetails', ['walletsWithBalance', 'currenciesWithPrices', function (walletsWithBalance, currenciesWithPrices) {
        return function (address) {
            return walletsWithBalance.single(address).then(
                function (wallet) {
                    return currenciesWithPrices.single(wallet.type).then(
                        function (currency) {
                            return {
                                label: wallet.label,
                                address: wallet.address,
                                type: wallet.type,
                                balance: wallet.balance,
                                balanceFloat: wallet.balanceFloat,
                                price: currency.priceusd.toString(),
                                value: (currency.priceusd * wallet.balanceFloat).toFixed(2).toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                            };
                        },
                        function (error) {
                            return {
                                label: wallet.label,
                                address: wallet.address,
                                type: wallet.type,
                                balance: wallet.balance,
                                balanceFloat: wallet.balanceFloat,
                                price: error,
                                value: error
                            };
                        }
                    );
                }
            );
        };
    }])

    //currency types with aggregate balances
    //return currencies = [Object { type="btc",  balance=float}, Object { type="doge",  balance=float}]
    .factory('currenciesBalance', ['walletsWithBalance', function (walletsWithBalance) {
        return function () {
            return walletsWithBalance.all().then(function (wallets) {
                var currencies = [];
                var currencyFound = false;
                for (var i in wallets) {
                    for (var j in currencies) {
                        if (currencies[j].type == wallets[i].type) {
                            currencies[j].balance += wallets[i].balanceFloat;
                            currencyFound = true;
                        }
                    }
                    if (!currencyFound) {
                        currencies.push({
                            type: wallets[i].type,
                            balance: wallets[i].balanceFloat
                        });
                    }
                }
                return currencies;
            });
        };
    }])

    .factory('currenciesBalancePrice', ['currenciesBalance', 'currenciesWithPrices', function (currenciesBalance, currenciesWithPrices) {
        return function () {
            return currenciesBalance().then(
                function (currencies) {
                    return currenciesWithPrices.all().then(
                        function (prices) {
                            var returnArray = [];
                            for (var i in currencies) {
                                for (var j in prices) {
                                    if (currencies[i].type == prices[j].type) {
                                        if ((currencies[i].balance % 1) === 0) currencies[i].balance = currencies[i].balance + '.00';
                                        returnArray.push({
                                            type: currencies[i].type,
                                            balance: currencies[i].balance,
                                            balanceString: currencies[i].balance.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' ' + currencies[i].type.toUpperCase(),
                                            priceusd: prices[j].priceusd,
                                            priceeur: prices[j].priceeur,
                                            pricebtc: prices[j].pricebtc,
                                            valueusd: currencies[i].balance * prices[j].priceusd,
                                            valuebtc: currencies[i].balance * prices[j].pricebtc,
                                            color: prices[j].color
                                        });
                                    }
                                }
                            }
                            return returnArray;
                        },
                        function (error) {
                            console.log('Error: currenciesBalancePrice');
                            return 'error';
                        }
                    );

                });
        };
    }])

    .factory('fixedTotalValue', ['Fixed', 'currenciesWithPrices', function (Fixed, currenciesWithPrices) {
        return function () {
            return currenciesWithPrices.all().then(
                function (prices) {
                    var btcPrice = _.find(prices, {
                        type: 'btc'
                    });
                    var eurPrice = _.find(prices, {
                        type: 'eur'
                    });
                    var fixed = Fixed.getFixed();
                    var fixedTotalValue = {
                        usd: 0,
                        eur: 0,
                        btc: 0
                    };
                    for (var i in fixed) {
                        fixedTotalValue.usd += fixed[i].valueFloat;
                        fixedTotalValue.eur += fixed[i].valueFloat / eurPrice.priceusd;
                        fixedTotalValue.btc += fixed[i].valueFloat / btcPrice.priceusd;
                    }
                    return fixedTotalValue;
                },
                function (error) {
                    console.log('Error: fixedTotalValue');
                    return 'error';
                }
            );
        };
    }])

    .factory('portfolioData', ['currenciesBalancePrice', 'fixedTotalValue', function (currenciesBalancePrice, fixedTotalValue) {
        return function () {
            return currenciesBalancePrice().then(function (currencies) {
                return fixedTotalValue().then(function (fixed) {
                    var returnObject = {};

                    var portfolioValue = {
                        btc: 0,
                        eur: 0,
                        usd: 0
                    };
                    //add currency values to portfolio value
                    for (var currency in currencies) {
                        portfolioValue.btc += currencies[currency].balance * currencies[currency].pricebtc;
                        portfolioValue.eur += currencies[currency].balance * currencies[currency].priceeur;
                        portfolioValue.usd += currencies[currency].balance * currencies[currency].priceusd;
                    }
                    //add fixed items value to portfolio value
                    portfolioValue.btc += fixed.btc;
                    portfolioValue.eur += fixed.eur;
                    portfolioValue.usd += fixed.usd;

                    var portfolioStructure = [];
                    //add currency type to portfolio structure
                    for (currency in currencies) {
                        var percent;
                        if (portfolioValue.usd === 0) percent = 0;
                        else percent = (currencies[currency].valueusd / portfolioValue.usd) * 100;
                        portfolioStructure.push({
                            type: currencies[currency].type,
                            percent: percent,
                            color: currencies[currency].color
                        });
                    }

                    //add fixed items to portfolio structure if fixedTotalValue!=0
                    if (fixed.usd !== 0) {
                        var fixedPercent = (fixed.usd / portfolioValue.usd) * 100;
                        portfolioStructure.push({
                            type: 'fix',
                            percent: fixedPercent,
                            color: '#009900'
                        });
                    }

                    returnObject.value = portfolioValue;
                    returnObject.structure = portfolioStructure;

                    //{value, structure}
                    return returnObject;
                });
            });
        };
    }]);
