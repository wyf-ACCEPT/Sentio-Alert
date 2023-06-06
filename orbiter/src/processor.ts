import { getChainName, scaleDown } from '@sentio/sdk'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { TransferEvent, ERC20Context } from '@sentio/sdk/eth/builtin/erc20'

const tokenAddressList: { [index: number]: [string, string, number][] } = {
  1: [
    ["WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
    ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
    ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6],
    ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
  ],
  10: [
    ["WETH", "0x4200000000000000000000000000000000000006", 18],
    ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
    ["USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ],
  56: [
    ["WETH", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 18],
    ["USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18],
    ["USDT", "0x55d398326f99059fF775485246999027B3197955", 18],
    ["DAI", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18],
  ],
  137: [
    ["WETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
    ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
    ["USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6],
    ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
  ],
  250: [
    ["WETH", "0x74b23882a30290451A17c44f4F05243b6b58C76d", 18],
    ["USDC", "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", 6],
    ["USDT", "0x049d68029688eAbF473097a2fC38ef61633A3C7A", 6],
    ["DAI", "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", 18],

  ],
  42161: [
    ["WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
    ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
    ["USDT", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ],
  43114: [
    ["WETH", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", 18],
    ["USDC", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6],
    ["USDT", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6],
    ["DAI", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18],
  ]
}

const EthPrice = 1800
const orbiter_addr = '0x41d3D33156aE7c62c094AAe2995003aE63f587B3'

const handleSwapOutOrbiter = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  return async function (event: TransferEvent, ctx: ERC20Context) {
    var value = scaleDown(event.args.value, decimal)
    if (tokenName == "WETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, {
      "src": chainName,
      "token": tokenName,
      "dst": "Unknown",
    })
  }
}

for (const [chainId, tokenList] of Object.entries(tokenAddressList)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    ERC20Processor.bind({ address: tokenAddr })
      .onEventTransfer(
        handleSwapOutOrbiter(chainId, tokenName, decimal, tokenAddr),
        ERC20Processor.filters.Transfer(null, orbiter_addr, null)
      )
  }
}