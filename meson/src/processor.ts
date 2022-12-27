import { MesonContext, MesonProcessor, SwapPostedEvent, SwapLockedEvent } from "./types/meson"

MesonProcessor.bind({ address: "0x25aB3Efd52e6470681CE037cD546Dc60726948D3", network: 137 })
  .onEventSwapPosted(async function (event: SwapPostedEvent, ctx: MesonContext) {
    const section = event.args.encodedSwap.mod(0x1000000000000);
    const outChain = Math.floor(section.div(0x100000000).toNumber())
    const inChain = Math.floor((section.mod(0x1000000)).toNumber() / 0x100)
    ctx.meter.Counter("transfer_out_cul").add(1, { "chainSlip": outChain.toString() })
  })

MesonProcessor.bind({ address: "0x25aB3Efd52e6470681CE037cD546Dc60726948D3", network: 42161 })
  .onEventSwapLocked(async function (event: SwapLockedEvent, ctx: MesonContext) {
    const section = event.args.encodedSwap.mod(0x1000000000000);
    const outChain = Math.floor(section.div(0x100000000).toNumber())
    const inChain = Math.floor((section.mod(0x1000000)).toNumber() / 0x100)
    ctx.meter.Counter("transfer_in_cul").add(1, { "chainSlip": inChain.toString() })
  })