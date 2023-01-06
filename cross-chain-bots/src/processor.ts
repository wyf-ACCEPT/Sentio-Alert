import type { BigNumber } from 'bignumber.js/bignumber';
import { chain, token } from '@sentio/sdk/lib/utils';
import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent } from './types/multichainrouter';
import { CBridgeContext, CBridgeProcessor, SendEvent } from './types/cbridge';

const MultichainMap: { [index: number]: [string[], [string, string, number][]] } = {
  1: [    // Ethereum
    [
      '0x6b7a87899490ece95443e979ca9485cbe7e71522',
      '0x765277eebeca2e31912c9946eae1021199b39c61',
      '0xba8da9dcf11b50b03fd5284f164ef5cdef910705'
    ], [
      ['ETH', '0x0615dbba33fe61a31c7ed131bda6655ed76748b1', 18],   // anyETH
      ['USDC', '0x7ea2be2df7ba6e54b1a9c70676f668455e329d29', 6],   // anyUSDC
      ['USDT', '0x22648c12acd87912ea1710357b1302c6a4154ebc', 6],   // anyUSDT
    ]],
  10: [  // Optimisim
    [
      '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98'
    ], [
      ['ETH', '0x965f84D915a9eFa2dD81b653e3AE736555d945f4', 18],
      ['USDC', '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', 6],
    ]
  ],
  56: [   // BNB Chain
    [
      '0xd1C5966f9F5Ee6881Ff6b261BBeDa45972B1B5f3'
    ], [
      ['ETH', '0xdebb1d6a2196f2335ad51fbde7ca587205889360', 18],
      ['USDC', '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2', 18],
      ['USDT', '0xedf0c420bc3b92b961c6ec411cc810ca81f5f21a', 18],
    ]
  ],
  137: [  // Polygon
    [
      '0x4f3Aff3A747fCADe12598081e80c6605A8be192F',
    ], [
      ['ETH', '0xbD83010eB60F12112908774998F65761cf9f6f9a', 18],
      ['USDC', '0xd69b31c3225728CC57ddaf9be532a4ee1620Be51', 6],
      ['USDT', '0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac', 6],
      ['DAI', '0x9b17bAADf0f21F03e35249e0e59723F34994F806', 18],
    ]
  ],
  42161: [  // Arbitrum
    [
      '0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50',
      '0x650Af55D5877F289837c30b94af91538a7504b76'
    ], [
      ['ETH', '0x1Dd9e9e142f3f84d90aF1a9F2cb617C7e08420a4', 18],
      ['USDC', '0x3405A1bd46B85c5C029483FbECf2F3E611026e45', 6],
      ['USDT', '0x05e481B19129B560E921E487AdB281E70Bdba463', 6],
      ['DAI', '0xaef9E3e050D0Ef060cdfd5246209B0B6BB66060F', 18],
    ]
  ],
  43114: [  // Avalanche
    [
      '0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8',
    ], [
      ['ETH', '0x7D09a42045359Aa85488bC07D0ADa83E22d50017', 18],
      ['USDC', '0xcc9b1F919282c255eB9AD2C0757E8036165e0cAd', 6],
      ['USDT', '0x94977c9888F3D2FAfae290d33fAB4a5a598AD764', 6],
      ['DAI', '0xd4143E8dB48a8f73afCDF13D7B3305F28DA38116', 18],
    ]
  ],
}

const CBridgeMap: { [index: number]: [string, [string, string, number][]] } = {
  1: [
    "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820", [
      ["ETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
      ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
      ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6],
      ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
      ["BUSD", "0x4Fabb145d64652a948d72533023f6E7A623C7C53", 18],
    ]],
  10: [
    "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401", [
      ["ETH", "0x4200000000000000000000000000000000000006", 18],
      ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
      ["USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
    ]],
  56: [
    "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF", [
      ["ETH", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 18],
      ["USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18],
      ["USDT", "0x55d398326f99059fF775485246999027B3197955", 18],
      ["DAI", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18],
      ["BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", 18],
    ]],
  137: [
    "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78", [
      ["ETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
      ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
      ["USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6],
      ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
      ["BUSD", "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7", 18],
    ]],
  42161: [
    "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca", [
      ["ETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
      ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
      ["USDT", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
    ]],
  43114: [
    "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", [
      ["ETH", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", 18],
      ["USDC", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6],
      ["USDT", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6],
      ["DAI", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18],
      ["BUSD", "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98", 18],
    ]]
}

const EthPrice = 1200

const mapOrder = function (value: BigNumber): string {
  if (value.lte(1)) return "bot (<$1)";
  else if (value.gt(1) && value.lte(100)) return "small ($1~$100)";
  else if (value.gt(100) && value.lte(3000)) return "medium ($100~$3k)";
  else return "large (>$3k)";
}

const handleSwapOutMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapOutEvent, ctx: MultichainRouterContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.toChainID.toString()).toLowerCase()
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
  }
}

const handleSwapOutCBridge = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SendEvent, ctx: CBridgeContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.dstChainId.toString()).toLowerCase()
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('swapOutAmount').record(value, {
        "to": toChain,
        "loc": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
      ctx.meter.Gauge('swapOutType').record(1, {
        "type": mapOrder(value),
        "to": toChain,
        "loc": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
    }
  }
}

// Multichain
for (const [chainId, [routerList, tokenList]] of Object.entries(MultichainMap)) {
  for (var [tokenName, tokenAddr, decimal] of tokenList) {
    for (var routerAddress of routerList) {
      MultichainRouterProcessor
        .bind({ address: routerAddress, network: Number(chainId) })
        .onEventLogAnySwapOut(
          handleSwapOutMultichain(chainId, tokenName, decimal),
          MultichainRouterProcessor.filters.LogAnySwapOut(tokenAddr)
        )
    }
  }
}

// CBridge
for (const [chainId, [cBridgeAddress, tokenList]] of Object.entries(CBridgeMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    CBridgeProcessor.bind({ address: cBridgeAddress, network: Number(chainId) })
      .onEventSend(handleSwapOutCBridge(chainId, tokenName, decimal, tokenAddr))
  }
}
