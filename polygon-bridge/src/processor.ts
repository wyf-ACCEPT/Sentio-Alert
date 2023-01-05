import { token, chain } from '@sentio/sdk/lib/utils'
import { ERC20Processor, ERC20Context, TransferEvent } from '@sentio/sdk/lib/builtin/erc20'
// import { PolygonBridgeProcessor, PolygonBridgeContext, LockedEtherEvent } from './types/polygonbridge'
// import { Poly}
import { PolygonBridgeEtherProcessor, PolygonBridgeEtherContext, LockedEtherEvent, ExitedEtherEvent } from './types/polygonbridgeether'
import { PolygonBridgeERCProcessor, PolygonBridgeERCContext, LockedERC20Event } from './types/polygonbridgeerc'

// Ethereum -> Polygon [ETH] (LockedEther, Transfer)
// https://etherscan.io/tx/0x2eb0d317c49b9d7d0ff16cb249f610520030db4f39f8d9baaf329942f3b40aff#eventlog
// https://polygonscan.com/tx/0x7e3d79ecaa87add82eff0246f91ec508bccc93fecbcf58af755414d0a49dfcee#eventlog

// Polygon -> Ethereum [ETH] (Transfer, ExitedEther)
// https://polygonscan.com/tx/0xe5c5874c12d06a13cd7615e83cb210f9a4775ff9d657916007750894f10fe531#eventlog
// https://etherscan.io/tx/0x629f342b83734dbc71307130d2ecfe72438346d4554e5fe1627c13aeff22bd28#eventlog

const PolygonBridgeEtherAddress = '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30' // Proxy
// Origin contract: 0x54006763154c764da4AF42a8c3cfc25Ea29765D5
const PolygonBridgeERCAddress = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf' // Proxy
// Origin contract: 0x608669d4914Eec1E20408Bc4c9eFFf27BB8cBdE5

const tokenMap: { [index: string]: [string, string, number] } = {
  // [token: [EthereumAddr, PolygonAddr, decimal]]
  'USDC': ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6],
  'USDT': ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6],
  'DAI': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18],
}
const ZeroAddress = '0x0000000000000000000000000000000000000000'
const PolygonWethAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
const EthPrice = 1200

const handleLockERC = function (tokenName: string, tokenDecimal: number) {
  return async function (event: LockedERC20Event, ctx: PolygonBridgeERCContext) {
    const value = token.scaleDown(event.args.amount, tokenDecimal)
    ctx.meter.Gauge('Eth_out').record(value, { "token": tokenName })
    ctx.meter.Counter('Eth_amount_out').add(value, { "token": tokenName })
  }
}

const handleExitERC = function (tokenName: string, tokenDecimal: number) {
  return async function (event: TransferEvent, ctx: ERC20Context) {
    const value = token.scaleDown(event.args.value, tokenDecimal)
    ctx.meter.Gauge('Eth_in').record(value, { "token": tokenName })
    ctx.meter.Counter('Eth_amount_in').add(value, { "token": tokenName })
  }
}

const handleWithZero = function (tokenName: string, tokenDecimal: number, tableName: 'out' | 'in') {
  return async function (event: TransferEvent, ctx: ERC20Context) {
    var value = token.scaleDown(event.args.value, tokenDecimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge('Polygon_' + tableName).record(value, { "token": tokenName })
    ctx.meter.Counter('Polygon_amount_' + tableName).add(value, { "token": tokenName })
  }
}

for (var [tokenName, [tokenAddrEth, tokenAddrMatic, tokenDecimal]] of Object.entries(tokenMap)) {
  PolygonBridgeERCProcessor.bind({ address: PolygonBridgeERCAddress })
    .onEventLockedERC20(
      handleLockERC(tokenName, tokenDecimal),
      PolygonBridgeERCProcessor.filters.LockedERC20(null, null, tokenAddrEth)
    )
  ERC20Processor.bind({ address: tokenAddrEth })
    .onEventTransfer(
      handleExitERC(tokenName, tokenDecimal),
      ERC20Processor.filters.Transfer(PolygonBridgeERCAddress, null)
    )
  ERC20Processor.bind({ address: tokenAddrMatic, network: 137 })
    .onEventTransfer(
      handleWithZero(tokenName, tokenDecimal, 'out'),
      ERC20Processor.filters.Transfer(null, ZeroAddress)
    )
    .onEventTransfer(
      handleWithZero(tokenName, tokenDecimal, 'in'),
      ERC20Processor.filters.Transfer(ZeroAddress, null)
    )
}

PolygonBridgeEtherProcessor.bind({ address: PolygonBridgeEtherAddress })
  .onEventLockedEther(async function (event: LockedEtherEvent, ctx: PolygonBridgeEtherContext) {
    const value = token.scaleDown(event.args.amount, 18).multipliedBy(EthPrice)
    ctx.meter.Gauge('Eth_out').record(value, { 'token': 'ETH' })
    ctx.meter.Counter('Eth_amount_out').add(value, { 'token': 'ETH' })
  })
  .onEventExitedEther(async function (event: ExitedEtherEvent, ctx: PolygonBridgeEtherContext) {
    const value = token.scaleDown(event.args.amount, 18).multipliedBy(EthPrice)
    ctx.meter.Gauge('Eth_in').record(value, { 'token': 'ETH' })
    ctx.meter.Counter('Eth_amount_in').add(value, { 'token': 'ETH' })
  })

ERC20Processor.bind({ address: PolygonWethAddress, network: 137 })
  .onEventTransfer(
    handleWithZero('ETH', 18, 'out'),
    ERC20Processor.filters.Transfer(null, ZeroAddress)
  )
  .onEventTransfer(
    handleWithZero('ETH', 18, 'in'),
    ERC20Processor.filters.Transfer(ZeroAddress, null)
  )
