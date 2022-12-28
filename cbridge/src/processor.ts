import { token, chain } from '@sentio/sdk/lib/utils'
import { CbridgeContext, CbridgeProcessor, SendEvent, RelayEvent } from './types/cbridge'

const tokenAddressList: { [index: number]: [string, string, number][] } = {
  1: [
    ["WETH", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 18],
    ["USDC", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 6],
    ["USDT", "0xdac17f958d2ee523a2206206994597c13d831ec7", 6],
    ["DAI", "0x6b175474e89094c44da98b954eedeac495271d0f", 18],
    ["BUSD", "0x4fabb145d64652a948d72533023f6e7a623c7c53", 18],
    ["FRAX", "0x853d955acef822db058eb8505911ed77f175b99e", 18],
  ],
  10: [
    ["WETH", "0x4200000000000000000000000000000000000006", 18],
    ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
    ["USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
    ["FRAX", "0x2E3D870790dC77A83DD1d18184Acc7439A53f475", 18],
  ],
  56: [
    ["WETH", "0x2170ed0880ac9a755fd29b2688956bd959f933f8", 18],
    ["USDC", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", 18],
    ["USDT", "0x55d398326f99059ff775485246999027b3197955", 18],
    ["DAI", "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", 18],
    ["BUSD", "0xe9e7cea3dedca5984780bafc599bd69add087d56", 18],
    ["FRAX", "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40", 18],
  ],
  137: [
    ["WETH", "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", 18],
    ["USDC", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 6],
    ["USDT", "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 6],
    ["DAI", "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", 18],
    ["BUSD", "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7", 18],
    ["FRAX", "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89", 18],
  ],
  42161: [
    ["WETH", "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", 18],
    ["USDC", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 6],
    ["USDT", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", 6],
    ["DAI", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 18],
    ["FRAX", "0x17fc002b466eec40dae837fc4be5c67993ddbd6f", 18],
  ],
  43114: [
    ["WETH", "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", 18],
    ["USDC", "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", 6],
    ["USDT", "0xc7198437980c041c805a1edcba50c1ce5db95118", 6],
    ["DAI", "0xd586e7f844cea2f87f50152665bcbc2c279d8d70", 18],
    ["BUSD", "0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98", 18],
    ["FRAX", "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64", 18],
    ["USDC2", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", 6],
    ["USDT2", "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", 6],
  ],
}

const cBridgeAddressList: { [index: number]: string } = {
  1: "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820",
  10: "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401",
  56: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
  137: "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78",
  42161: "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca",
  43114: "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4",
}

const handleSwapIn = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId)
  return async function (event: RelayEvent, ctx: CbridgeContext) {
    const inAmount = token.scaleDown(event.args.amount, decimal)
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('transfer_in').record(inAmount, { "from": chain.getChainName(event.args.srcChainId.toString()), "loc": chainName, "token": tokenName })
    }
  }
}

const handleSwapOut = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId)
  return async function (event: SendEvent, ctx: CbridgeContext) {
    const outAmount = token.scaleDown(event.args.amount, decimal)
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('transfer_out').record(outAmount, { "to": chain.getChainName(event.args.dstChainId.toString()), "loc": chainName, "token": tokenName })
    }
  }
}

for (var [chainId, cBridgeAddress] of Object.entries(cBridgeAddressList)) {
  const tokenList = tokenAddressList[Number(chainId)]
  for (var [tokenName, tokenAddr, decimal] of tokenList) {
    CbridgeProcessor.bind({ address: cBridgeAddress, network: Number(chainId) })
      .onEventSend(
        handleSwapOut(chainId, tokenName, decimal, tokenAddr)
      )
      .onEventRelay(
        handleSwapIn(chainId, tokenName, decimal, tokenAddr)
      )
  }
}