import { token, chain } from '@sentio/sdk/lib/utils'
import { StargatePoolContext, StargatePoolProcessor, SwapEvent } from "./types/stargatepool";

const chainIdMap: { [index: number]: [number, string] } = {
  101: [1, "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56"],     //eth
  102: [56, "0x98a5737749490856b401DB5Dc27F522fC314A4e1"],    //binance
  106: [43114, "0x1205f31718499dBf1fCa446663B532Ef87481fe1"], //avalanche
  109: [137, "0x1205f31718499dBf1fCa446663B532Ef87481fe1"],   //polygon
  110: [42161, "0x892785f33CdeE22A30AEF750F285E18c18040c3e"], //arbitrum
  111: [10, "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298"],    //optimism
}

const poolIdMap: { [index: number]: [string, number] } = {
  1: ["USDC", 6],
  2: ["USDT", 6],
  3: ["DAI", 18],
  7: ["FRAX", 18],
  13: ["ETH", 18],
}

const EthPrice = 1200

const handleSwapIn = function (chainId: string, tokenName: string, decimal: number, poolID: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SwapEvent, ctx: StargatePoolContext) {
    var inAmount = token.scaleDown(event.args.amountSD, decimal)
    if (event.args.dstPoolId.toNumber() == 1) {
      inAmount = inAmount.multipliedBy(EthPrice)
    }
    if (event.args.dstPoolId.toNumber() == poolID) {
      ctx.meter.Gauge("transfer_out").record(inAmount, { "loc": chainName, "token": tokenName, "from": event.args.chainId.toString() })
    }
  }
}

for (const [gateId, [chainID, sBindAddress]] of Object.entries(chainIdMap)) {
  for (const [poolID, [tokenName, decimal]] of Object.entries(poolIdMap)) {
    StargatePoolProcessor.bind({ address: sBindAddress, network: Number(chainID) })
      .onEventSwap(handleSwapIn(String(chainID), tokenName, decimal, poolID))
  }
}