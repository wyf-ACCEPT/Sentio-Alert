import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { HopBridgeProcessor, HopBridgeContext } from './types/hopbridge'
import { HopTokenSwapProcessor, HopTokenSwapContext, TokenSwapEvent } from './types/hoptokenswap'

const saddleSwapMap: { [index: number]: [number, { [index: string]: string }] } = {
  10: [29000000, {     // Optimism
    'USDC': '0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963',
  }],
  137: [16000000, {    // Polygon
    'USDC': '0x5C32143C8B198F392d01f8446b754c181224ac26',
  }],
  42161: [15000000, {   // Arbitrum
    'USDC': '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261',
  }],
}

const handleTokenSwap = function (tokenName: string) {
  return async function (event: TokenSwapEvent, ctx: HopTokenSwapContext) {
    if (event.args.soldId.toBigInt() == 1n) {
      var price = event.args.tokensSold.toNumber() / event.args.tokensBought.toNumber()
    } else {
      var price = event.args.tokensBought.toNumber() / event.args.tokensSold.toNumber()
    }
    ctx.meter.Gauge(tokenName + '_price').record(price)
  }
}

for (var [chainId, [startBlock, tokens]] of Object.entries(saddleSwapMap)) {
  for (var [tokenName, saddleAddr] of Object.entries(tokens)) {
    HopTokenSwapProcessor.bind({ address: saddleAddr, network: Number(chainId), startBlock: startBlock })
      .onEventTokenSwap(handleTokenSwap(tokenName))
  }
}