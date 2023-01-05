import { chain, token } from '@sentio/sdk/lib/utils';
import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent } from './types/multichainrouter';

const addressMap: { [index: number]: [string[], [string, string, number][]] } = {
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
    ],
    [
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
    ],
    [
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
    ],
    [
      ['ETH', '0x1Dd9e9e142f3f84d90aF1a9F2cb617C7e08420a4', 18],
      ['USDC', '0x3405A1bd46B85c5C029483FbECf2F3E611026e45', 6],
      ['USDT', '0x05e481B19129B560E921E487AdB281E70Bdba463', 6],
      ['DAI', '0xaef9E3e050D0Ef060cdfd5246209B0B6BB66060F', 18],
    ]
  ],
  43114: [  // Avalanche
    [
      '0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8',
    ],
    [
      ['ETH', '0x7D09a42045359Aa85488bC07D0ADa83E22d50017', 18],
      ['USDC', '0xcc9b1F919282c255eB9AD2C0757E8036165e0cAd', 6],
      ['USDT', '0x94977c9888F3D2FAfae290d33fAB4a5a598AD764', 6],
      ['DAI', '0xd4143E8dB48a8f73afCDF13D7B3305F28DA38116', 18],
    ]
  ],
}

const EthPrice = 1200

const handleSwapOutMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapOutEvent, ctx: MultichainRouterContext) {
    var outAmount = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') outAmount = outAmount.multipliedBy(EthPrice)
    ctx.meter.Gauge('swapOutAmount').record(outAmount, { 
      "to": chain.getChainName(event.args.toChainID.toString()).toLowerCase(), 
      "loc": chainName, 
      "token": tokenName,
      "bridge": 'Multichain',
     })
  }
}

// Multichain
for (const [chainId, [routerList, tokenList]] of Object.entries(addressMap)) {
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
