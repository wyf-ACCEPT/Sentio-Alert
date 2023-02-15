import { LayerzeroContext, LayerzeroProcessor } from "./types/eth/layerzero.js"

const chainIdMap: { [index: number]: string } = {
  102: 'BNB Chain',
  106: 'Avalanche',
  109: 'Polygon',
  110: 'Arbitrum',
  111: 'Optimism',
  112: 'Fantom',
}

const handleLayer0 = function (chainId: number) {
  var chainName = chainIdMap[chainId]
  return async function (event: any, ctx: LayerzeroContext) {
    const [nativeFee, zroFee] = await ctx.contract.estimateFees(
      chainId,
      '0x0000000000000000000000000000000000000000',
      '0x',
      false,
      '0x'
    )
    ctx.meter.Gauge('fee').record(nativeFee.scaleDown(18), { "type": "nativeFee", 'loc': chainName })
    ctx.meter.Gauge('fee').record(zroFee.scaleDown(18), { "type": "zroFee", 'loc': chainName })
  }
}

for (const [gateId, _] of Object.entries(chainIdMap)) {
  LayerzeroProcessor
    .bind({ address: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675', startBlock: 15800000 })
    .onBlockInterval(handleLayer0(Number(gateId)), 5000)
}

