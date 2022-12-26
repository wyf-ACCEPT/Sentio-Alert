import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { ERC20Processor, ERC20Context, TransferEvent } from '@sentio/sdk/lib/builtin/erc20'
// import { PolygonBridgeProcessor, PolygonBridgeContext, LockedEtherEvent } from './types/polygonbridge'
// import { Poly}
import { PolygonBridgeEtherProcessor, PolygonBridgeEtherContext, LockedEtherEvent } from './types/polygonbridgeether'
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

PolygonBridgeEtherProcessor.bind({ address: PolygonBridgeEtherAddress, startBlock: 16100000 })
  .onEventLockedEther(async function (event: LockedEtherEvent, ctx: PolygonBridgeEtherContext ) {
    ctx.meter.Counter('Eth_tx_out').add(1)
  })