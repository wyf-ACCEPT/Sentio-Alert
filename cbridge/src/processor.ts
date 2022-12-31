import { token, chain } from '@sentio/sdk/lib/utils'
import { CbridgeContext, CbridgeProcessor, SendEvent, RelayEvent } from './types/cbridge'

const tokenAddressList: { [index: number]: [string, [string, string, number][]] } = {
  1: [
    "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820", [
      ["WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
      ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
      ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6],
      ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
      ["BUSD", "0x4Fabb145d64652a948d72533023f6E7A623C7C53", 18],
      ["FRAX", "0x853d955aCEf822Db058eb8505911ED77F175b99e", 18]
    ]],
  10: [
    "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401", [
      ["WETH", "0x4200000000000000000000000000000000000006", 18],
      ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
      ["USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
      ["FRAX", "0x2E3D870790dC77A83DD1d18184Acc7439A53f475", 18]
    ]],
  56: [
    "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF", [
      ["WETH", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 18],
      ["USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18],
      ["USDT", "0x55d398326f99059fF775485246999027B3197955", 18],
      ["DAI", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18],
      ["BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", 18],
      ["FRAX", "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40", 18]
    ]],
  137: [
    "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78", [
      ["WETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
      ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
      ["USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6],
      ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
      ["BUSD", "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7", 18],
      ["FRAX", "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89", 18]
    ]],
  42161: [
    "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca", [
      ["WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
      ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
      ["USDT", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
      ["FRAX", "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F", 18]
    ]],
  43114: [
    "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", [
      ["WETH", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", 18],
      ["USDC", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6],
      ["USDT", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6],
      ["DAI", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18],
      ["BUSD", "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98", 18],
      ["FRAX", "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64", 18],
      ["USDC2", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", 6],
      ["USDT2", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", 6]
    ]]
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

// const handleSwapOut = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
//   const chainName = chain.getChainName(chainId)
//   return async function (event: SendEvent, ctx: CbridgeContext) {
//     const outAmount = token.scaleDown(event.args.amount, decimal)
//     if (event.args.token == tokenAddr) {
//       ctx.meter.Gauge('transfer_out').record(outAmount, { "to": chain.getChainName(event.args.dstChainId.toString()), "loc": chainName, "token": tokenName })
//     }
//   }
// }

for (const [chainId, [cBridgeAddress, tokenList]] of Object.entries(tokenAddressList)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    CbridgeProcessor.bind({ address: cBridgeAddress, network: Number(chainId) })
      .onEventRelay(handleSwapIn(chainId, tokenName, decimal, tokenAddr))
    // .onEventSend(
    //   handleSwapOut(chainId, tokenName, decimal, tokenAddr)
    // )
  }
}