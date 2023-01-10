import { chain } from '@sentio/sdk/lib/utils';
import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { Multichain_routerProcessor, Multichain_routerContext, LogAnySwapInEvent, LogAnySwapOutEvent } from './types/multichain_router'
import { AnytokenProcessor, AnytokenContext } from './types/anytoken';

const addressMap: { [index: number]: [string[], [string, string, number][]] } = {
  1: [    // Ethereum
    [
      '0x6b7a87899490ece95443e979ca9485cbe7e71522',
      '0x765277eebeca2e31912c9946eae1021199b39c61',
      '0xba8da9dcf11b50b03fd5284f164ef5cdef910705'
    ], [
      ['anyETH', '0x0615dbba33fe61a31c7ed131bda6655ed76748b1', 18],
      ['anyUSDC', '0x7ea2be2df7ba6e54b1a9c70676f668455e329d29', 6],
      ['anyUSDT', '0x22648c12acd87912ea1710357b1302c6a4154ebc', 6],
    ]],
  56: [   // BNB Chain
    [
      '0xd1C5966f9F5Ee6881Ff6b261BBeDa45972B1B5f3'
    ], [
      ['anyETH', '0xdebb1d6a2196f2335ad51fbde7ca587205889360', 18],
      ['anyUSDC', '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2', 18],
      ['anyUSDT', '0xedf0c420bc3b92b961c6ec411cc810ca81f5f21a', 18],
    ]
  ],
  137: [  // Polygon
    [
      '0x4f3Aff3A747fCADe12598081e80c6605A8be192F',
    ], [
      ['anyETH', '0xbD83010eB60F12112908774998F65761cf9f6f9a', 18],
      ['anyUSDC', '0xd69b31c3225728CC57ddaf9be532a4ee1620Be51', 6],
      ['anyUSDT', '0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac', 6],
      ['anyDAI', '0x9b17bAADf0f21F03e35249e0e59723F34994F806', 18],
    ]
  ],
  10: [  // Optimisim
    [
      '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98'
    ], [
      ['anyETH', '0x965f84D915a9eFa2dD81b653e3AE736555d945f4', 18],
      ['anyUSDC', '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', 6],
    ]
  ],
  42161: [  // Arbitrum
    [
      '0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50',
      '0x650Af55D5877F289837c30b94af91538a7504b76'
    ], [
      ['anyETH', '0x1Dd9e9e142f3f84d90aF1a9F2cb617C7e08420a4', 18],
      ['anyUSDC', '0x3405A1bd46B85c5C029483FbECf2F3E611026e45', 6],
      ['anyUSDT', '0x05e481B19129B560E921E487AdB281E70Bdba463', 6],
      ['anyDAI', '0xaef9E3e050D0Ef060cdfd5246209B0B6BB66060F', 18],
    ]
  ],
  43114: [  // Avalanche
    [
      '0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8',
    ], [
      ['anyETH', '0x7D09a42045359Aa85488bC07D0ADa83E22d50017', 18],
      ['anyUSDC', '0xcc9b1F919282c255eB9AD2C0757E8036165e0cAd', 6],
      ['anyUSDT', '0x94977c9888F3D2FAfae290d33fAB4a5a598AD764', 6],
      ['anyDAI', '0xd4143E8dB48a8f73afCDF13D7B3305F28DA38116', 18],
    ]
  ],
  250: [  // Fantom
    [
      '0x1CcCA1cE62c62F7Be95d4A67722a8fDbed6EEcb4',
    ], [
      ['anyETH', '0xBDC8fd437C489Ca3c6DA3B5a336D11532a532303', 18],
      ['anyUSDC', '0x95bf7E307BC1ab0BA38ae10fc27084bC36FcD605', 6],
      ['anyUSDT', '0x2823D10DA533d9Ee873FEd7B16f4A962B2B7f181', 6],
      ['anyDAI', '0xd652776dE7Ad802be5EC7beBfafdA37600222B48', 18],
    ]
  ]
}

const EthPrice = 1200

const handleSupply = function (chainId: number, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (_: any, ctx: AnytokenContext) {
    var supply = scaleDown(await ctx.contract.totalSupply(), decimal)
    if (tokenName == 'anyETH') supply = supply.multipliedBy(EthPrice)
    ctx.meter.Gauge("TotalSupply").record(supply, { "token": tokenName, "loc": chainName })
  }
}

const handleSwapIn = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapInEvent, ctx: Multichain_routerContext) {
    var inAmount = scaleDown(event.args.amount, decimal)
    if (tokenName == 'anyETH') inAmount = inAmount.multipliedBy(EthPrice)
    ctx.meter.Gauge('anyswapIn').record(inAmount, { "from": chain.getChainName(event.args.fromChainID.toString()).toLowerCase(), "loc": chainName, "token": tokenName })
  }
}

const handleSwapOut = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapOutEvent, ctx: Multichain_routerContext) {
    var outAmount = scaleDown(event.args.amount, decimal)
    if (tokenName == 'anyETH') outAmount = outAmount.multipliedBy(EthPrice)
    ctx.meter.Gauge('anyswapOut').record(outAmount, { "to": chain.getChainName(event.args.toChainID.toString()).toLowerCase(), "loc": chainName, "token": tokenName })
  }
}

for (const [chainId, [routerList, tokenList]] of Object.entries(addressMap)) {
  for (var [tokenName, tokenAddr, decimal] of tokenList) {
    AnytokenProcessor.bind({ address: tokenAddr, network: Number(chainId) })
      .onBlock(handleSupply(Number(chainId), tokenName, decimal))
    for (var routerAddress of routerList) {
      Multichain_routerProcessor
        .bind({ address: routerAddress, network: Number(chainId) })
        .onEventLogAnySwapIn(
          handleSwapIn(chainId, tokenName, decimal),
          Multichain_routerProcessor.filters.LogAnySwapIn(null, tokenAddr)
        )
        .onEventLogAnySwapOut(
          handleSwapOut(chainId, tokenName, decimal),
          Multichain_routerProcessor.filters.LogAnySwapOut(tokenAddr)
        )
    }
  }
}
