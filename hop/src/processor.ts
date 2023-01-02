import type { Block } from '@ethersproject/providers'
import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { getChainName } from '@sentio/sdk/lib/utils/chain'
import { HopTokenSwapProcessor, HopTokenSwapContext } from './types/hoptokenswap'

const saddleSwapMap: { [index: number]: [number, [string, string, number][]] } = {
  10: [13474342, [     // Optimism: Jun-29-2022 04:57:45 PM +UTC
    ['USDC', '0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963', 6],
    ['USDT', '0xeC4B41Af04cF917b54AEb6Df58c0f8D78895b5Ef', 6],
    ['DAI', '0xF181eD90D6CfaC84B8073FdEA6D34Aa744B41810', 18],
    ['WETH', '0xaa30D6bba6285d0585722e2440Ff89E23EF68864', 18],
  ]],
  137: [23000000, [    // Polygon: Dec-26-2021 09:53:30 PM +UTC
    ['USDC', '0x5C32143C8B198F392d01f8446b754c181224ac26', 6],
    ['USDT', '0xB2f7d27B21a69a033f85C42d5EB079043BAadC81', 6],
    ['DAI', '0x25FB92E505F752F730cAD0Bd4fa17ecE4A384266', 18],
    ['WETH', '0x266e2dc3C4c59E42AA07afeE5B09E964cFFe6778', 18],
  ]],
  42161: [4000000, [  // Arbitrum: Dec-21-2021 01:46:13 PM +UTC
    ['USDC', '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261', 6],
    ['USDT', '0x18f7402B673Ba6Fb5EA4B95768aABb8aaD7ef18a', 6],
    ['DAI', '0xa5A33aB9063395A90CCbEa2D86a62EcCf27B5742', 18],
    ['WETH', '0x652d27c0F72771Ce5C76fd400edD61B406Ac6D97', 18],
  ]],
}

const EthPrice = 1200

const handleBlock = function (chainId: number, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  return async function (block: Block, ctx: HopTokenSwapContext) {
    const priceOrigin = scaleDown(await ctx.contract.calculateSwap(0, 1, 10n ** BigInt(decimal)), decimal)
    var balanceOrigin = scaleDown(await ctx.contract.getTokenBalance(0), decimal)
    var balanceHWrap = scaleDown(await ctx.contract.getTokenBalance(1), decimal)
    ctx.meter.Gauge("price").record(priceOrigin, { "pair": tokenName + '_h' + tokenName, "loc": chainName })
    if (tokenName == 'WETH') {
      balanceOrigin = balanceOrigin.multipliedBy(EthPrice)
      balanceHWrap = balanceHWrap.multipliedBy(EthPrice)
    }
    ctx.meter.Gauge("pool").record(balanceOrigin, { "token": tokenName, "loc": chainName })
    ctx.meter.Gauge("pool").record(balanceHWrap, { "token": 'h' + tokenName, "loc": chainName })
  }
}

for (var [chainId, [startBlock, tokens]] of Object.entries(saddleSwapMap)) {
  for (var [tokenName, saddleAddr, decimal] of tokens) {
    HopTokenSwapProcessor
      .bind({ address: saddleAddr, network: Number(chainId), startBlock: startBlock })
      .onBlock(handleBlock(Number(chainId), tokenName, decimal))
  }
}
