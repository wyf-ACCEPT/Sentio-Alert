import { token, chain } from '@sentio/sdk/lib/utils'
import { SynapseProcessor, SynapseContext, TokenDepositAndSwapEvent, TokenRedeemAndSwapEvent } from './types/synapse'


const Map: { [index: number]: [string, [number, string, string, number][]] } = {
  1: ["0x2796317b0fF8538F253012862c06787Adfb8cEb6", [
    [1, "USDC", "0x7ea2be2df7ba6e54b1a9c70676f668455e329d29", 18],
    [2, "USDT", "0x22648c12acd87912ea1710357b1302c6a4154ebc", 18],
  ]],     // ethereum

  10: ["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b", [
    [1, "USDC", "0xf390830DF829cf22c53c8840554B98eafC5dCBc2", 18],
    [2, "USDT", "0x86B3F23B6e90F5bbfac59b5b2661134Ef8Ffd255", 18],
  ]],     // optimism

  137: ["0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280", [
    [1, "USDC", "0xd69b31c3225728CC57ddaf9be532a4ee1620Be51", 18],
    [2, "USDT", "0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac", 18],
  ]],     // polygon

  42161: ["0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9", [
    [1, "USDC", "0x3405A1bd46B85c5C029483FbECf2F3E611026e45", 18],
    [2, "USDT", "0x05e481B19129B560E921E487AdB281E70Bdba463", 18],
  ]],     // arbitrum

  43114: ["0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE", [
    [1, "USDC", "0xcc9b1F919282c255eB9AD2C0757E8036165e0cAd", 18],
    [2, "USDT", "0x94977c9888F3D2FAfae290d33fAB4a5a598AD764", 18],
  ]],     // avalanche

  250: ["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b", [
    [1, "USDC", '0x95bf7E307BC1ab0BA38ae10fc27084bC36FcD605', 18],
    [2, "USDT", '0x2823D10DA533d9Ee873FEd7B16f4A962B2B7f181', 18],
  ]], //fantom

  56: ["0xd123f70AE324d34A9E76b67a27bf77593bA8749f", [
    [1, "USDC", '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2', 18],
    [2, "USDT", '0xedf0c420bc3b92b961c6ec411cc810ca81f5f21a', 18],
  ]] //binance
}


const handleSwapOut = function (chainId: string, tokenName: string, decimal: number, tokenidx: number) {
  return async function (event: TokenDepositAndSwapEvent, ctx: SynapseContext) {
    var OutAmount = token.scaleDown(event.args.amount, decimal)
    const dstChain = chain.getChainName(event.args.chainId.toNumber())
    if (event.args.tokenIndexTo == tokenidx) {
      ctx.meter.Gauge("transfer_out").record(OutAmount, { "token": tokenName, "dst": dstChain })
    }
  }
}


const handleSwapIn = function (chainId: string, tokenName: string, decimal: number, tokenidx: number) {
  return async function (event: TokenRedeemAndSwapEvent, ctx: SynapseContext) {
    var InAmount = token.scaleDown(event.args.amount, decimal)
    const srcChain = chain.getChainName(event.args.chainId.toNumber())
    if (event.args.tokenIndexTo == tokenidx) {
      ctx.meter.Gauge("transfer_in").record(InAmount, { "token": tokenName, "dst": srcChain })
    }
  }
}


for (const [chainId, [poolAddr, tokenList]] of Object.entries(Map)) {
  for (const [tokenidx, tokenName, tokenAddr, decimal] of tokenList) {
    SynapseProcessor.bind({ address: poolAddr, network: Number(chainId) })
      .onEventTokenDepositAndSwap(
        handleSwapOut(chainId, tokenName, decimal, tokenidx),
      )
      .onEventTokenRedeemAndSwap(
        handleSwapIn(chainId, tokenName, decimal, tokenidx)
      )
  }
}



