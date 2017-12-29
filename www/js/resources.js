angular.module('crypto.resources', ['ngResource'])

    .factory('walletDatabtc', ['$resource', function ($resource) {
        var apiRequest = $resource("https://api.smartbit.com.au/v1/blockchain/address/:address", {
            limit: '1'
        });
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return (((data || {}).address || {}).total || {}).balance;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDatadoge', ['$resource', function ($resource) {
        var apiRequest = $resource("http://dogechain.info/api/v1/address/balance/:address");
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data.balance;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDataltc', ['$resource', function ($resource) {
        var apiRequest = $resource("https://chain.so/api/v2/get_address_balance/LTC/:address");
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return ((data || {}).data || {}).confirmed_balance;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDataeth', ['$resource', function ($resource) {
        var apiRequest = $resource("https://api.ethplorer.io/getAddressInfo/:address?apiKey=freekey");
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return (((data || {}).ETH || {}).balance).toString();
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDataxrp', ['$resource', function ($resource) {
        var apiRequest = $resource("https://data.ripple.com/v2/accounts/:address/balances");
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        //function(data){ return ((data || {}).balasnces[0] || {}).value;},
                        function (data) {
                            return (((data || {}).balances || {})[0] || {}).value;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDataxcp', ['$resource', function ($resource) {
        var apiRequest = $resource("https://xchain.io/api/address/:address");
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return (data || {}).xcp_balance;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDatardd', ['$resource', function ($resource) {
        var apiRequest = $resource("http://live.reddcoin.com/api/addr/:address/balance", {}, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return {
                        data: response
                    }; //creating object
                }
            }
        });
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data.data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return (parseFloat(data.data) / 100000000).toString();
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('walletDatadash', ['$resource', function ($resource) {
        var apiRequest = $resource('https://explorer.dash.org/chain/Dash/q/addressbalance/:address', {}, {
            get: {
                //isArray:true,
                method: 'get',
                transformResponse: function (data, headers) {
                    return {
                        data: JSON.parse(data)
                    };
                }
            }
        });
        return {
            full: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data.data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
            balance: function (address) {
                return apiRequest.get({
                        address: address
                    }).$promise
                    .then(
                        function (data) {
                            return data.data;
                        },
                        function (error) {
                            return 'error';
                        }
                    );
            },
        };
    }])

    .factory('currencyDataeur', ['$resource', function ($resource) {
        var apiRequest = $resource("http://api.fixer.io/latest?symbols=EUR,USD");
        var currencyColor = '#003399';
        return {
            full: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        return data;
                    },
                    function (error) {
                        return error;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.rates.USD;
                        returndata.color = currencyColor;
                        return returndata;
                    },
                    function (error) {
                        return 'error';
                    }
                );
            }
        };
    }])

    .factory('currencyDatadoge', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=DOGE&tsyms=BTC,USD,EUR");
        var currencyColor = '#D9BD62';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    },
                    function (error) {
                        return 'error';
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    },
                    function (error) {
                        return 'error';
                    }
                );
            }
        };
    }])

    .factory('currencyDatabtc', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR");
        var currencyColor = '#FF9900';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDataltc', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=BTC,USD,EUR");
        var currencyColor = '#B3B3B3';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDataeth', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR");
        var currencyColor = '#616891';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDataxrp', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=BTC,USD,EUR");
        var currencyColor = '#346aa9';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDataxcp', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=XCP&tsyms=BTC,USD,EUR");
        var currencyColor = '#ed1650';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDatardd', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=RDD&tsyms=BTC,USD,EUR");
        var currencyColor = '#e95359';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }])

    .factory('currencyDatadash', ['$resource', function ($resource) {
        var apiRequest = $resource("https://min-api.cryptocompare.com/data/price?fsym=DASH&tsyms=BTC,USD,EUR");
        var currencyColor = '#346aa9';
        return {
            full: function () {
                return apiRequest.get();
            },
            all: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            },
            usd: function () {
                return apiRequest.get().$promise.then(
                    function (data) {
                        var returndata = {};
                        returndata.price = data.usd;
                        returndata.color = currencyColor;
                        return returndata;
                    }
                );
            }
        };
    }]);
