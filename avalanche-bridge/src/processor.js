"use strict";
exports.__esModule = true;
var BridgeEthereumAddress = '0x8EB8a3b98659Cce290402893d0123abb75E3ab28';
var BridgeAvalancheAddress = '0xa0357704F7B78306f401A03d08d1D7b8a6555AcF';
var tokenMap = {
    // [token: [EthAddr, AvaxAddr, decimal]]
    'USDT': ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', 6],
    'USDC': ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', 6],
    'DAI': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', 18],
    'WETH': ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18]
};
for (var _i = 0, _a = Object.entries(tokenMap); _i < _a.length; _i++) {
    var _b = _a[_i], tokenName = _b[0], _c = _b[1], tokenAddrEth = _c[0], tokenAddrAvax = _c[1], tokenDecimal = _c[2];
    console.log(tokenName, [tokenAddrEth, tokenAddrAvax, tokenDecimal]);
}
