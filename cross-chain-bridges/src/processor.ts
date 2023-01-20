import { BigNumber } from 'bignumber.js/bignumber';
import { chain, token } from '@sentio/sdk/lib/utils';
import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent } from './types/multichainrouter';
import { CBridgeContext, CBridgeProcessor, SendEvent } from './types/cbridge';
import { HopBridgeContext, HopBridgeProcessor, TransferSentEvent } from './types/hopbridge';
import { HopBridgeEthereumContext, HopBridgeEthereumProcessor, TransferSentToL2Event } from './types/hopbridgeethereum';
import { StargatePoolContext, StargatePoolProcessor, SwapEvent } from './types/stargatepool';
import { AcrossToContext, AcrossToProcessor, FundsDepositedEvent } from './types/acrossto';
import { MultichainMap, CBridgeMap, HopMap, StargateMap, AcrossMap } from './addresses';

const EthPrice = 1200

const mapOrder = function (value: BigNumber): string {
  if (value.lte(1)) return "bot (<$1)";
  else if (value.gt(1) && value.lte(100)) return "small ($1~$100)";
  else if (value.gt(100) && value.lte(3000)) return "medium ($100~$3k)";
  else return "large (>$3k)";
}


// ================================= Multichain =================================
const handleSwapOutMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapOutEvent, ctx: MultichainRouterContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.toChainID.toString()).toLowerCase()
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
  }
}

for (const [chainId, [routerList, tokenList]] of Object.entries(MultichainMap)) {
  for (var [tokenName, tokenAddr, decimal] of tokenList) {
    for (var routerAddress of routerList) {
      MultichainRouterProcessor
        .bind({ address: routerAddress, network: Number(chainId) })
        .onEventLogAnySwapOut(
          handleSwapOutMultichain(chainId, tokenName, decimal),
          MultichainRouterProcessor.filters.LogAnySwapOut(tokenAddr)
        )
    }
  }
}


// ================================= CBridge =================================
const handleSwapOutCBridge = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SendEvent, ctx: CBridgeContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.dstChainId.toString()).toLowerCase()
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('swapOutAmount').record(value, {
        "to": toChain,
        "loc": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
      ctx.meter.Gauge('swapOutType').record(1, {
        "type": mapOrder(value),
        "to": toChain,
        "loc": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
    }
  }
}

for (const [chainId, [cBridgeAddress, tokenList]] of Object.entries(CBridgeMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    CBridgeProcessor.bind({ address: cBridgeAddress, network: Number(chainId) })
      .onEventSend(handleSwapOutCBridge(chainId, tokenName, decimal, tokenAddr))
  }
}


// ================================= Hop =================================
const handleSwapOutHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (
    event: TransferSentEvent | TransferSentToL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.chainId.toString()).toLowerCase()
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Hop',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Hop',
    })
  }
}

for (const [chainId, tokenList] of Object.entries(HopMap)) {
  if (Number(chainId) == 1) {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeEthereumProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSentToL2(handleSwapOutHop(chainId, tokenName, decimal))
    }
  } else {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSent(handleSwapOutHop(chainId, tokenName, decimal))
    }
  }
}


// ================================= Stargate =================================
const StargateChainIdMap: { [index: number]: number } = {
  1: 1, 2: 56, 6: 43114, 9: 137, 10: 42161, 11: 10, 12: 250,
  101: 1, 102: 56, 106: 43114, 109: 137, 110: 42161, 111: 10, 112: 250,
}

const handleSwapOutStargate = function (chainId: string, tokenName: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SwapEvent, ctx: StargatePoolContext) {
    var value = token.scaleDown(event.args.amountSD, 6)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice).dividedBy(1000000000000)
    const toChain = chain.getChainName(StargateChainIdMap[event.args.chainId]).toLowerCase()
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
  }
}

for (const [chainId, tokenList] of Object.entries(StargateMap)) {
  for (const [tokenName, poolAddress, poolID] of tokenList) {
    StargatePoolProcessor.bind({ address: poolAddress, network: Number(chainId) })
      .onEventSwap(handleSwapOutStargate(chainId.toString(), tokenName))
  }
}


// ================================= AcrossTo =================================
const handleSwapOutAcross = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: FundsDepositedEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    const toChain = chain.getChainName(event.args.destinationChainId.toNumber()).toLowerCase()
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'AcrossTo',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "to": toChain,
      "loc": chainName,
      "token": tokenName,
      "bridge": 'AcrossTo',
    })
  }
}

for (const [chainId, [poolAddr, tokenList]] of Object.entries(AcrossMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    AcrossToProcessor.bind({ address: poolAddr, network: Number(chainId) })
      .onEventFundsDeposited(
        handleSwapOutAcross(chainId, tokenName, decimal),
        AcrossToProcessor.filters.FundsDeposited(null, null, null, null, null, null, tokenAddr)
      )
  }
}