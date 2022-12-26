import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { chain } from '@sentio/sdk/lib/utils'
import { AcrossProcessor, AcrossContext, FundsDepositedEvent, FilledRelayEvent } from './types/across'

const AcrossAddressEth = '0x4D9079Bb4165aeb4084c526a32695dCfd2F77381'
const AcrossAddressMatic = '0x69B5c72837769eF1e7C164Abc6515DcFf217F920'
const StartBlockEth = 10000000
const StartBlockMatic = 6500000

const WETH: { [index: number]: string } = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}

// const TokenMap: { [index: string]: string } = {
//   "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//   "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//   "USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
//   "DAI": "0x6b175474e89094c44da98b954eedeac495271d0f",
// }

const handleSwapOut = function (chainId: number, tokenName: string, decimal: number) {
  return async function (event: FundsDepositedEvent, ctx: AcrossContext) {
    const amount = scaleDown(event.args.amount, decimal)
    const dstChain = chain.getChainName(event.args.destinationChainId.toNumber())
    if (event.args.originToken == WETH[chainId]) {
      ctx.meter.Gauge("transfer_out").record(amount, { "token": tokenName, "dst": dstChain })
      ctx.meter.Counter("transfer_out_cul").add(1, { "token": tokenName, "dst": dstChain })
    }
  }
}

const handleSwapIn = function (chainId: number, tokenName: string, decimal: number) {
  return async function (event: FilledRelayEvent, ctx: AcrossContext) {
    const amount = scaleDown(event.args.amount, decimal)
    const srcChain = chain.getChainName(event.args.originChainId.toNumber())
    if (event.args.destinationToken == WETH[chainId]) {
      ctx.meter.Gauge("transfer_in").record(amount, { "token": tokenName, "src": srcChain })
      ctx.meter.Counter("transfer_in_cul").add(1, { "token": tokenName, "src": srcChain })
    }
  }
}

AcrossProcessor.bind({ address: AcrossAddressEth, startBlock: StartBlockEth, network: 1 })
  .onEventFundsDeposited(handleSwapOut(1, 'WETH', 18))
  .onEventFilledRelay(handleSwapIn(1, 'WETH', 18))

AcrossProcessor.bind({ address: AcrossAddressMatic, startBlock: StartBlockMatic, network: 137 })
  .onEventFundsDeposited(handleSwapOut(137, 'WETH', 18))
  .onEventFilledRelay(handleSwapIn(137, 'WETH', 18))