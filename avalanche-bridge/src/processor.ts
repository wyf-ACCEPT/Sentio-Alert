import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { ERC20Processor, ERC20Context, TransferEvent } from '@sentio/sdk/lib/builtin/erc20'
import { ERC20BridgeProcessor, ERC20BridgeContext, UnwrapEvent, MintEvent } from './types/erc20bridge'

const BridgeEthereumAddress = '0x8EB8a3b98659Cce290402893d0123abb75E3ab28'
const BridgeEthereumAddressOld = '0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0'
const BridgeAvalancheAddress = '0x0000000000000000000000000000000000000000'

const StartBlockEth = 16100000
const StartBlockAvax = 23000000

const tokenMap: { [index: string]: [string, string, number] } = {
  // [token: [EthAddr, AvaxAddr, decimal]]
  'USDC': ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', 6],
  'USDT': ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', 6],
  'DAI': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', 18],
  // 'WETH': ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18],
}

const handleTransfer = function (tokenName: string, tokenDecimal: number, tableName: 'out' | 'in') {
  return async function (event: TransferEvent, ctx: ERC20Context) {
    const value = scaleDown(event.args.value, tokenDecimal)
    ctx.meter.Gauge('Eth_' + tableName).record(value, { "token": tokenName })
    ctx.meter.Counter('Eth_tx_' + tableName).add(1, { "token": tokenName })
  }
}

const handleUnwrap = function (tokenName: string, tokenDecimal: number) {
  return async function (event: UnwrapEvent, ctx: ERC20BridgeContext) {
    const value = scaleDown(event.args.amount, tokenDecimal)
    ctx.meter.Gauge('Avax_out').record(value, { "token": tokenName })
    ctx.meter.Counter('Avax_tx_out').add(1, { "token": tokenName })
  }
}

const handleMint = function (tokenName: string, tokenDecimal: number) {
  return async function (event: MintEvent, ctx: ERC20BridgeContext) {
    const value = scaleDown(event.args.amount, tokenDecimal)
    const feevalue = scaleDown(event.args.feeAmount, tokenDecimal)
    ctx.meter.Gauge('Avax_in').record(value, { "token": tokenName })
    ctx.meter.Gauge('Avax_fee_in').record(feevalue, { "token": tokenName })
    ctx.meter.Counter('Avax_tx_in').add(1, { "token": tokenName })
  }
}


for (var [tokenName, [tokenAddrEth, tokenAddrAvax, tokenDecimal]] of Object.entries(tokenMap)) {
  ERC20Processor.bind({ address: tokenAddrEth, network: 1 })
    .onEventTransfer(
      handleTransfer(tokenName, tokenDecimal, 'out'),
      [
        ERC20Processor.filters.Transfer(null, BridgeEthereumAddress),
        ERC20Processor.filters.Transfer(null, BridgeEthereumAddressOld)
      ])
    .onEventTransfer(
      handleTransfer(tokenName, tokenDecimal, 'in'),
      [
        ERC20Processor.filters.Transfer(BridgeEthereumAddress, null),
        ERC20Processor.filters.Transfer(BridgeEthereumAddressOld, null)
      ])
  ERC20BridgeProcessor.bind({ address: tokenAddrAvax, network: 43114 })
    .onEventUnwrap(handleUnwrap(tokenName, tokenDecimal))
    .onEventMint(handleMint(tokenName, tokenDecimal))
}

