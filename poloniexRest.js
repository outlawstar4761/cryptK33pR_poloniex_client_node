var self = this;
self.crypto = require('crypto');
self.queryStr = require('querystring');
self.hostname = 'poloniex.com';
self.port = 443;
self.publicKey = '1234';
self.privateKey = '1234';
self.apiBase = 'https://poloniex.com/public?';
self.publicMethods = [
    'returnTicker',
    'return24Volume',
    'returnOrderBook',
    'returnTradeHistory',
    'returnChartData',
    'returnCurrencies',
    'returnLoanOrders'
];
self.privateMethods = [
    'returnBalances',
    'returnCompleteBalances',
    'returnDepositAddresses',
    'generateNewAddress',
    'returnDepositsWithdrawals',
    'returnOpenOrders',
    'returnTradeHistory',
    'returnOrderTrades',
    'buy',
    'sell',
    'cancelOrder',
    'moveOrder',
    'withdraw',
    'returnFeeInfo',
    'returnAvailableAccountBalances',
    'returnTradableBalances',
    'transferBalance',
    'returnMarginAccountSummary',
    'marginBuy',
    'marginSell',
    'getMarginPosition',
    'closeMarginPosition',
    'createLoanOffer',
    'cancelLoanOffer',
    'returnOpenLoanOffers',
    'returnActiveLoans',
    'returnLendingHistory',
    'toggleAutoRenew'
];
self.getUrl = function(url){
    return new Promise(function(resolve,reject){
        const https = require('https');
        https.get(url,function(response){
            let data = '';
            response.on('data',function(chunk){
                data += chunk;
            });
            response.on('end',function(){
                resolve(JSON.parse(data));
            });
        }).on('error',function(err){
            reject(err.message);
        });
    });
}
self.postUrl = function(method){
    return new Promise(function(resolve, reject){
        const https = require('https');
        var params = {command:method,nonce:Math.floor(new Date().getTime() * 1000)};
        var options = {
            hostname:self.hostname,
            port:self.port,
            path:'/tradingApi',
            method:'POST',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                "Content-Length": Buffer.byteLength(self.queryStr.stringify(params)),
                "Key":self.publicKey,
                "Sign":self.buildSignature(params)
            }
        };
        var req = https.request(options,function(response){
            let data = '';
            response.on('data',function(chunk){
                data += chunk;
            });
            response.on('end',function(){
                resolve(JSON.parse(data));
            });
        }).on('error',function(err){
            reject(err.message);
        });
        req.write(self.queryStr.stringify(params));
    });
}
self.apiCall = function(method,params){
    if(self.publicMethods.indexOf(method) > -1){
        return new Promise(function(resolve, reject){
            var url = self.apiBase + self.queryStr.stringify(params);
            self.getUrl(url).then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
        });
    }else if(self.privateMethods.indexOf(method) > -1){
        return new Promise(function(resolve, reject){
            self.postUrl(method).then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
        });
    }else{
        throw new Error('Invalid API Method');
    }
}
self.buildSignature = function(params){
    return self.crypto.createHmac('sha512',self.privateKey).update(self.queryStr.stringify(params)).digest('hex');
}
self.getTicker = function(){
    return new Promise(function(resolve,reject){
        var params = {command:"returnTicker"}
        self.apiCall("returnTicker",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getVolume = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"return24hVolume"};
        self.apiCall("return24hVolume",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getOrderBook = function(market,depth){
    return new Promise(function(resolve, reject){
        var params = {command:"returnOrderBook",currencyPair:market,depth:depth};
        self.apiCall("returnOrderBook",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getCurrencies = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnCurrencies"};
        self.apiCall("returnCurrencies",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getLoanOffers = function(currency){
    return new Promise(function(resolve, reject){
        var params = {command:"returnLoanOrders",currency:currency};
        self.apiCall("returnLoanOrders",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}

/*PRIVATE*/

self.getBalances = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnBalances"};
        self.apiCall("returnBalances",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getCompleteBalances = function(all = false){
    return new Promise(function(resolve, reject){
        var params = {command:"returnCompleteBalances"};
        if(all){
            params.account = "all";
        }
        self.apiCall("returnCompleteBalances",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getDepositAddresses = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnDepositAddresses"};
        self.apiCall("returnDepositAddresses",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}

/*
* Only one address per currency per day may be generated,
* and a new address may not be generated before the previously-generated one has been used.
* */

self.generateNewAddress = function(currency){
    return new Promise(function(resolve, reject){
        var params = {command:"generateNewAddress",currency:currency};
        self.apiCall("generateNewAddress",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
//Returns your deposit and withdrawal history within a range, specified by the "start" and "end" POST parameters, both of which should be given as UNIX timestamps.
self.getDepositsWithdrawals = function(start,end){
    return new Promise(function(resolve, reject){
        var params = {command:"returnDepositsWithdrawals",start:start,end:end};
        self.apiCall("returnDepositsWithdrawals",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getOpenOrders = function(market){
    return new Promise(function(resolve, reject){
        var params = {command:'returnOpenOrders',currencyPair:market};
        self.apiCall("returnOpenOrders",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getTradeHistory = function(market,start,end){
    return new Promise(function(resolve, reject){
        var params = {command:"returnTradeHistory",currencyPair:market,start:start,end:end};
        self.apiCall("returnTradeHistory").then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getOrderTrades = function(orderNumber){
    return new Promise(function(resolve, reject){
        var params = {command:"returnOrderTrades",orderNumber:orderNumber};
        self.apiCall("returnOrderTrades",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
/*
* You may optionally set "fillOrKill", "immediateOrCancel", "postOnly" to 1. A fill-or-kill order will either fill in its entirety or be completely aborted.
 * An immediate-or-cancel order can be partially or completely filled, but any portion of the order that cannot be filled immediately will be canceled rather than left on the order book.
  * A post-only order will only be placed if no portion of it fills immediately; this guarantees you will never pay the taker fee on any part of the order that fills.
* */
self.buy = function(market,rate,amount,fillOrKill = 0,immediateOrCancel = 0,postOnly = 0){
    return new Promise(function(resolve, reject){
        var params = {command:"buy",currencyPair:market,rate:rate,amount:amount};
        if(fillOrKill){
            params.fillOrKill = 1;
        }
        if(immediateOrCancel){
            params.immediateOrCancel = 1;
        }
        if(postOnly){
            params.postOnly = 1;
        }
        self.apiCall("buy",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.sell = function(market,rate,amount){
    return new Promise(function(resolve, reject){
        var params = {command:"sell",currencyPair:market,rate:rate,amount:amount};
        self.apiCall("sell",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.cancelOrder = function(orderNumber){
    return new Promise(function(resolve, reject){
        var params = {command:"cancelOrder",orderNumber:orderNumber};
        self.apiCall("cancelOrder",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.moveOrder = function(orderNumber,rate,amount = null,postOnly = 0,immediateOrCancel = 0){
    return new Promise(function(resolve, reject){
        var params = {command:"moveOrder",rate:rate};
        if(amount !== null){
            params.amount = amount;
        }
        if(postOnly){
            params.postOnly = 1;
        }
        if(immediateOrCancel){
            params.immediateOrCancel = 1;
        }
        self.apiCall("moveOrder",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.withdraw = function(curreny,amount,address,paymentId = null){
    return new Promise(function(resolve, reject){
        var params = {command:'withdraw',currency:curreny,amount:amount,address:address};
        if(paymentId !== null){
            params.paymentId = paymentId;
        }
        self.apiCall("withdraw",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getFeeInfo = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnFeeInfo"};
        self.apiCall("returnFeeInfo",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getAvailableBalances = function(account = null){
    return new Promise(function(resolve, reject){
        var params = {command:"returnAvailableAccountBalances"};
        if(currency !== null){
            params.account = account;
        }
        self.apiCall("returnAvailableAccountBalances",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
/*
* Returns your current tradable balances for each currency in each market for which margin trading is enabled.
* Please note that these balances may vary continually with market conditions.
* */
self.getTradableBalances = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnTradableBalances"};
        self.apiCall("returnTradableBalances",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.transferBalance = function(currency,amount,from,to){
    return new Promise(function(resolve, reject){
        var params = {command:"transferBalance",currency:currency,amount:amount,fromAccount:from,toAccount:to};
        self.apiCall("transferBalance",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarginAccountSummary = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnMarginAccountSummary"};
        self.apiCall("returnMarginAccountSummary",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.marginBuy = function(market,rate,amount,lendingRate = null){
    return new Promise(function(resolve, reject){
        var params = {command:"marginBuy",currencyPair:market,rate:rate,amount:amount};
        if(lendingRate !== null){
            params.lendingRate = lendingRate;
        }
        self.apiCall("marginBuy",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.marginSell = function(market,rate,amount,lendingRate = null){
    return new Promise(function(resolve, reject){
        var params = {command:"marginSell",currencyPair:market,rate:rate,amount:amount};
        if(lendingRate !== null){
            params.lendingRate = lendingRate;
        }
        self.apiCall("marginSell",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarginPosition = function(market){
    return new Promise(function(resolve, reject){
        var params = {command:"getMarginPosition",currencyPair:market};
        self.apiCall("getMarginPosition",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.closeMarginPosition = function(market){
    return new Promise(function(resolve, reject){
        var params = {command:"closeMarginPosition",currencyPair:market};
        self.apiCall("closeMarginPosition",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.createLoanOffer = function(currency,amount,duration,lendingRate,autoRenew = false){
    return new Promise(function(resolve, reject){
        var params = {command:"createLoanOffer",currency:currency,amount:amount,duration:duration,lendingRate:lendingRate};
        if(autoRenew){
            params.autoRenew = 1;
        }else{
            params.autoRenew = 0;
        }
        self.apiCall("createLoanOffer",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.cancelLoanOffer = function(orderNumber){
    return new Promise(function(resolve, reject){
        var params = {command:"cancelLoanOffer",orderNumber:orderNumber};
        self.apiCall("cancelLoanOffer",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
/*
* Returns your active loans for each currency.
* */
self.getOpenLoanOffers = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnOpenLoanOffers"};
        self.apiCall("returnOpenLoanOffers",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getActiveLoans = function(){
    return new Promise(function(resolve, reject){
        var params = {command:"returnActiveLoans"};
        self.apiCall("returnActiveLoans",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getLendingHistory = function(start,end,limit = null){
    return new Promise(function(resolve, reject){
        var params = {command:"returnLendingHistory",start:start,end:end};
        if(limit !== null){
            params.limit = limit;
        }
        self.apiCall("returnLendingHistory",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.toggleAutoRenew = function(orderNumber){
    return new Promise(function(resolve, reject){
        var params = {command:"toggleAutoRenew",orderNumber:orderNumber};
        self.apiCall("toggleAutoRenew",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}

module.exports = self;