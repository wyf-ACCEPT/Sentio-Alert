import { token, chain } from '@sentio/sdk/lib/utils'
import { StargatePoolContext, StargatePoolProcessor, SwapEvent } from "./types/stargatepool";
const chainIdMap: { [index: number]: [number, string, [string, string, number][]] } = {
  101: [1, "0x8731d54E9D02c286767d56ac03e8037C07e01e98", [
    ["USDC", "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", 1],
    ["USDT", "0x38EA452219524Bb87e18dE1C24D3bB59510BD783", 2],
    ["DAI", "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d", 3],
    ["FRAX", "0xfA0F307783AC21C39E939ACFF795e27b650F6e68", 7], 
    ["ETH", "0x101816545F6bd2b1076434B54383a1E633390A2E", 13],
  ]],     // eth

  102: [56, "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8", [
    ["USDT", "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda", 2],
  ]],     // binance

  106: [43114, "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd", [
    ["USDC", "0x1205f31718499dBf1fCa446663B532Ef87481fe1", 1],
    ["USDT", "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", 2],
    ["FRAX", "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", 7],
  ]],     // avalanche

  109: [137, "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd", [
    ["USDC", "0x1205f31718499dBf1fCa446663B532Ef87481fe1", 1],
    ["USDT", "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", 2],
    ["DAI", "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", 3],
  ]],     // polygon

  110: [42161, "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614", [
    ["USDC", "0x892785f33CdeE22A30AEF750F285E18c18040c3e", 1],
    ["USDT", "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641", 2],
    ["FRAX", "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C", 7],
    ["ETH", "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e", 13],
  ]],     // arbitrum

  111: [10, "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", [
    ["USDC", "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298", 1],
    ["DAI", "0x165137624F1f692e69659f944BF69DE02874ee27", 3],
    ["FRAX", "0x368605D9C6243A80903b9e326f1Cddde088B8924", 7],
    ["ETH", "0xd22363e3762cA7339569F3d33EADe20127D5F98C", 13],
  ]],     // optimism

  112: [250, "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6", [
    ["USDC", "0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97", 1],
  ]],     // fantom
}

const EthPrice = 1200

const handleSwapOut = function (chainId: string, tokenName: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SwapEvent, ctx: StargatePoolContext) {
    var inAmount = token.scaleDown(event.args.amountSD, 6)
    if (tokenName == 'ETH') { inAmount = inAmount.multipliedBy(EthPrice).dividedBy(1000000000000) }
    // const dstChainName = chain.getChainName(chainIdMap[event.args.chainId][0]).toLowerCase()
    ctx.meter.Gauge("transfer_out").record(inAmount, { "loc": chainName, "token": tokenName, "to": event.args.chainId.toString() })
  }
}

for (const [gateId, [chainID, sRouteAddress, tokenList]] of Object.entries(chainIdMap)) {
  for (const [tokenName, BindAddress, poolID] of tokenList) {
    StargatePoolProcessor.bind({ address: BindAddress, network: Number(chainID) })
      .onEventSwap(handleSwapOut(chainID.toString(), tokenName))
  }
}