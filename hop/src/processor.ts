import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { HopBridgeProcessor, HopBridgeContext } from './types/hopbridge'
import { HopTokenSwapProcessor, HopTokenSwapContext, TokenSwapEvent } from './types/hoptokenswap'

const saddleSwapMap: { [index: number]: [number, [[string, string, number]]] } = {
  10: [29000000, [     // Optimism
    ['USDC', '0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963', 6],
  ]],
  137: [16000000, [    // Polygon
    ['USDC', '0x5C32143C8B198F392d01f8446b754c181224ac26', 6],
  ]],
  42161: [15000000, [  // Arbitrum
    ['USDC', '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261', 6],
  ]],
}


const handleBlock = function (tokenName: string, decimal: number) {
  return async function (_: any, ctx: HopTokenSwapContext) {
    const priceOrigin = scaleDown(await ctx.contract.calculateSwap(0, 1, 10n ** BigInt(decimal)), decimal)
    const balanceOrigin = scaleDown(await ctx.contract.getTokenBalance(0), decimal)
    const balanceHWrap = scaleDown(await ctx.contract.getTokenBalance(1), decimal)
    ctx.meter.Gauge("price").record(priceOrigin, { "pair": tokenName + '_h' + tokenName })
    ctx.meter.Gauge("pool").record(balanceOrigin, { "token": tokenName })
    ctx.meter.Gauge("pool").record(balanceHWrap, { "token": 'h' + tokenName })
  }
}

for (var [chainId, [startBlock, tokens]] of Object.entries(saddleSwapMap)) {
  for (var [tokenName, saddleAddr, decimal] of tokens) {
    HopTokenSwapProcessor.bind({ address: saddleAddr, network: Number(chainId), startBlock: startBlock })
      .onBlock(handleBlock(tokenName, decimal))
  }
}
