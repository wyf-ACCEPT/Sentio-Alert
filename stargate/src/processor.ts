import { token, chain } from '@sentio/sdk/lib/utils'
import { StargatePoolContext, StargatePoolProcessor, SwapEvent } from "./types/stargatepool";

StargatePoolProcessor.bind({ address: '0x892785f33CdeE22A30AEF750F285E18c18040c3e', network: 42161 })
  .onEventSwap(async function (event: SwapEvent, ctx: StargatePoolContext) {
    if (event.args.dstPoolId.toNumber() == 1) {
      const outAmount = token.scaleDown(event.args.amountSD, 6)
      ctx.meter.Gauge("transfer_out").record(outAmount, { "loc": 'arbitrum', "token": 'USDC', "dst": event.args.chainId.toString() })
    }
  })