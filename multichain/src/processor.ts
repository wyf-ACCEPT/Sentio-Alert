import { chain } from '@sentio/sdk/lib/utils';
import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { Multichain_routerProcessor, Multichain_routerContext, LogAnySwapInEvent, LogAnySwapOutEvent } from './types/multichain_router'
import { AnytokenProcessor, AnytokenContext } from './types/anytoken';

const addressMap: { [index: number]: [number, string[], [string, string, number][]] } = {
  1: [    // Ethereum
    16000000,
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
    23000000,
    [
      '0xd1C5966f9F5Ee6881Ff6b261BBeDa45972B1B5f3'
    ], [
      ['anyETH', '0xdebb1d6a2196f2335ad51fbde7ca587205889360', 18],
      ['anyUSDC', '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2', 18],
      ['anyUSDT', '0x58340a102534080b9d3175f868aea9f6af986dd9', 18],
      ['anyUSDT', '0xedf0c420bc3b92b961c6ec411cc810ca81f5f21a', 18],  // 2 types of anyUSDT in BSC!
    ]
  ],
  // 137: [  // Polygon

  // ]

}


const handleSupply = function (tokenName: string, decimal: number) {
  return async function (_: any, ctx: AnytokenContext) {
    const supply = scaleDown(await ctx.contract.totalSupply(), decimal)
    ctx.meter.Gauge("TotalSupply").record(supply, { "name": tokenName })
  }
}

for (const [chainId, [blockNumber, routerList, tokenList]] of Object.entries(addressMap)) {
  for (var [tokenName, tokenAddr, decimal] of tokenList) {
    AnytokenProcessor.bind({ address: tokenAddr, network: Number(chainId), startBlock: blockNumber })
      .onBlock(handleSupply(tokenName, decimal))
  }
}


// const handleSwapIn = function (chainId: string, tokenName: string, decimal: number) {
//   return async function (event: LogAnySwapInEvent, ctx: Multichain_routerContext) {
//     const inAmount = scaleDown(event.args.amount, decimal)
//     ctx.meter.Gauge('anyswapIn').record(inAmount, { "from": chain.getChainName(event.args.fromChainID.toString()), "to": chain.getChainName(chainId), "token": tokenName })
//     ctx.meter.Counter('netOutFlow').sub(inAmount, { "location": chain.getChainName(chainId), "token": tokenName })
//     ctx.meter.Counter('netOutFlow').add(inAmount, { "location": chain.getChainName(event.args.fromChainID.toString()), "token": tokenName })
//   }
// }

// for (const [chainId, [blockNumber, routerList, tokenList]] of Object.entries(addressMap)) {
//   for (var routerAddress of routerList) {
//     for (var [tokenName, tokenAddress, tokenDecimal] of tokenList) {
//       Multichain_routerProcessor
//         .bind({ address: routerAddress, network: Number(chainId), startBlock: blockNumber })
//         .onEventLogAnySwapIn(
//           handleSwapIn(chainId, tokenName, tokenDecimal),
//           Multichain_routerProcessor.filters.LogAnySwapIn(null, tokenAddress)
//         )
//     }
//   }
// }
