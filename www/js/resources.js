angular.module('crypto.resources', ['ngResource'])

.factory('walletDatabtc', ['$resource', function ($resource) {
    var apiRequest = $resource("https://api.smartbit.com.au/v1/blockchain/address/:address",{limit:'1'});
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return (((data || {}).address || {}).total || {}).balance; },
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDatadoge', ['$resource', function ($resource) {
    var apiRequest = $resource("http://dogechain.info/api/v1/address/balance/:address");
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data.balance; },
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDataltc', ['$resource', function ($resource) {
    var apiRequest = $resource("http://ltc.blockr.io/api/v1/address/info/:address");
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return ((data || {}).data || {}).balance;},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDataeth', ['$resource', function ($resource) {
    var apiRequest = $resource("https://etherchain.org/api/account/:address");
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return (parseFloat(((data || {}).data[0] || {}).balance)/1000000000000000000).toString();},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDataxrp', ['$resource', function ($resource) {
    var apiRequest = $resource("https://data.ripple.com/v2/accounts/:address/balances");
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data; },
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                //function(data){ return ((data || {}).balasnces[0] || {}).value;},
                function(data){ return (((data || {}).balances || {})[0] || {}).value;},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDataxcp', ['$resource', function ($resource) {
    var apiRequest = $resource("http://xcp.blockscan.com/api2");
    return {
        full: function(address){
            return apiRequest.get({module: 'address', action: 'balance', btc_address: address, asset: 'XCP'}).$promise
            .then(
                function(data){ return data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({module: 'address', action: 'balance', btc_address: address, asset: 'XCP'}).$promise
            .then(
                function(data){ return (((data || {}).data || {})[0] || {}).balance;},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDatardd', ['$resource', function ($resource) {
    var apiRequest = $resource("https://live.reddcoin.com/api/addr/:address/balance", {}, {
                       get: {
                          method: 'GET',
                          transformResponse: function(response){
                             return {data: response}; //creating object
                          }
                       }
                    });
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data.data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return (parseFloat(data.data)/100000000).toString();},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDatadash', ['$resource', function ($resource) {
    var apiRequest = $resource('https://explorer.dash.org/chain/Dash/q/addressbalance/:address',{},{
        get:{
            //isArray:true,
            method:'get',
            transformResponse: function (data, headers) {
                return {data: JSON.parse(data)};
            }}
    });
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data.data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data.data;},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('walletDatappc', ['$resource', function ($resource) {
    var apiRequest = $resource("http://ppc.blockr.io/api/v1/address/balance/:address");
    return {
        full: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return data.data;},
                function(error){ return 'error'; }
            );
        },
        balance: function(address){
            return apiRequest.get({address: address}).$promise
            .then(
                function(data){ return ((data || {}).data || {}).balance;},
                function(error){ return 'error'; }
            );
        },
    };
}])

.factory('currencyDatadoge', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/doge");
    var currencyColor = '#D9BD62';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                },
                function (error){ return 'error';}
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                },
                function (error){ return 'error';}
            );
        }
    }
}])

.factory('currencyDatabtc', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/btc");
    var currencyColor = '#FF9900';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDataltc', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/ltc");
    var currencyColor = '#B3B3B3';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDataeth', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/eth");
    var currencyColor = '#616891';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDataxrp', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/xrp");
    var currencyColor = '#346aa9';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDataxcp', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/xcp");
    var currencyColor = '#ed1650';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDatardd', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/rdd");
    var currencyColor = '#e95359';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDatadash', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/dash");
    var currencyColor = '#346aa9';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

.factory('currencyDatappc', ['$resource', function ($resource) {
    var apiRequest = $resource("http://coinmarketcap-nexuist.rhcloud.com/api/ppc");
    var currencyColor = '#1f7b00';
    return {
        full: function(){
            return apiRequest.get();
        },
        all: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        },
        usd: function(){
            return apiRequest.get().$promise.then(
                function (data) { 
                    var returndata = {};
                    returndata.price = data.price.usd;
                    returndata.color = currencyColor;
                    return returndata;
                }
            );
        }
    }
}])

;