// import { AcrossToProcessor, AcrossToContext, FundsDepositedEvent, FilledRelayEvent } from './types/acrossto'
import { getChainName, scaleDown } from "@sentio/sdk"
import { token } from "@sentio/sdk/utils"
import { AcrossNewProcessor, AcrossNewContext, FundsDepositedEvent, FilledRelayEvent } from "./types/eth/acrossnew.js"

// New address (2023/5/2)
// Ethereum: 0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5
// Polygon: 0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096
// Arbitrum: 0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A
// Optimism: 0x6f26Bf09B1C792e3228e5467807a900A503c0281

const AcrossMap: { [index: number]: [string[], [string, string, number][]] } = {
  1: [[
    // "0x4D9079Bb4165aeb4084c526a32695dCfd2F77381",
    "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",
  ], [
    ["ETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
    ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
    ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
  ]],     // Ethereum

  10: [[
    // "0xa420b2d1c0841415A695b81E5B867BCD07Dff8C9",
    "0x6f26Bf09B1C792e3228e5467807a900A503c0281",
  ], [
    ["ETH", "0x4200000000000000000000000000000000000006", 18],
    ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ]],     // Optimism

  137: [[
    // "0x69B5c72837769eF1e7C164Abc6515DcFf217F920",
    "0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096",
  ], [
    ["ETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
    ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
    ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
  ]],     // Polygon

  42161: [[
    // "0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C",
    "0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A",
  ], [
    ["ETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
    ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ]],     // Arbitrum
}

const EthPrice = 1600

const handleSwapOutAcross = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  return async function (event: FundsDepositedEvent, ctx: AcrossNewContext) {

    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.originToken == tokenAddr) {
      ctx.meter.Gauge("swapOutAmount").record(value, {
        "src": chainName,
        "token": tokenName,
        "dst": getChainName(Number(event.args.destinationChainId)).toLowerCase(),
      })
    }
  }
}

// const handleSwapInAcross = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
//   const chainName = getChainName(chainId).toLowerCase()
//   return async function (event: FilledRelayEvent, ctx: AcrossNewContext) {
//     var value = scaleDown(event.args.amount, decimal)
//     if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
//     if (event.args.destinationToken == tokenAddr) {
//       ctx.meter.Gauge("swapInAmount").record(value, {
//         "src": getChainName(Number(event.args.originChainId)).toLowerCase(),
//         "token": tokenName,
//         "dst": chainName,
//       })
//     }
//   }
// }

for (const [chainId, [poolList, tokenList]] of Object.entries(AcrossMap)) {
  for (const poolAddr of poolList)
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      AcrossNewProcessor.bind({ address: poolAddr, network: Number(chainId) })
        .onEventFundsDeposited(
          handleSwapOutAcross(chainId, tokenName, decimal, tokenAddr),
          // AcrossNewProcessor.filters.FundsDeposited(null, null, null, null, null, null, tokenAddr)
        )
      // .onEventFilledRelay(
      //   handleSwapInAcross(chainId, tokenName, decimal, tokenAddr)
      // )
    }
}