import { getChainName } from "@sentio/sdk/lib/core/chain";
import { scaleDown, BigDecimal } from "@sentio/sdk/lib/core";

import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent, LogAnySwapInEvent } from "./types/eth/multichainrouter";
import { CBridgeContext, CBridgeProcessor, SendEvent, RelayEvent } from "./types/eth/cbridge";
import {
  HopBridgeContext, HopBridgeProcessor, TransferSentEvent, WithdrawalBondedEvent as WithdrawalBondedL2Event
} from "./types/eth/hopbridge";
import {
  HopBridgeEthereumContext, HopBridgeEthereumProcessor, TransferSentToL2Event, WithdrawalBondedEvent as WithdrawalBondedEthereumEvent
} from "./types/eth/hopbridgeethereum";
import { StargatePoolContext, StargatePoolProcessor, SwapEvent, SwapRemoteEvent } from "./types/eth/stargatepool";
import { 
  AcrossToContext as AcrossToOldContext, AcrossToProcessor as AcrossToOldProcessor, 
  FundsDepositedEvent as FundsDepositedEventOld, FilledRelayEvent as FilledRelayEventOld,
} from "./types/eth/acrossto";
import { 
  AcrossToNewContext, AcrossToNewProcessor, 
  FundsDepositedEvent as FundsDepositedEventNew, FilledRelayEvent as FilledRelayEventNew,
} from "./types/eth/acrosstonew";
import { MultichainMap, CBridgeMap, HopMap, StargateMap, AcrossMap } from "./addresses";

const EthPrice = 1200

const mapOrder = function (value: BigDecimal): string {
  if (value.lte(1)) return "bot (<$1)";
  else if (value.gt(1) && value.lte(100)) return "small ($1~$100)";
  else if (value.gt(100) && value.lte(3000)) return "medium ($100~$3k)";
  else return "large (>$3k)";
}

const generateLabel = function (
  chainName: string,
  tokenName: string,
  bridge: string,
  isOut: boolean
): { [index: string]: string } {
  if (isOut) return {
    "src": chainName,
    "token": tokenName,
    "bridge": bridge,
  }; else return {
    "dst": chainName,
    "token": tokenName,
    "bridge": bridge,
  }
}


// ================================= Multichain =================================
const handleSwapOutMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Multichain", true)
  return async function (event: LogAnySwapOutEvent, ctx: MultichainRouterContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapInMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Multichain", false)
  return async function (event: LogAnySwapInEvent, ctx: MultichainRouterContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
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
        .onEventLogAnySwapIn(
          handleSwapInMultichain(chainId, tokenName, decimal),
          MultichainRouterProcessor.filters.LogAnySwapIn(null, tokenAddr)
        )
    }
  }
}


// ================================= CBridge =================================
const handleSwapOutCBridge = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "CBridge", true)
  return async function (event: SendEvent, ctx: CBridgeContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

const handleSwapInCBridge = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "CBridge", false)
  return async function (event: RelayEvent, ctx: CBridgeContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

for (const [chainId, [cBridgeAddress, tokenList]] of Object.entries(CBridgeMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    CBridgeProcessor.bind({ address: cBridgeAddress, network: Number(chainId) })
      .onEventSend(handleSwapOutCBridge(chainId, tokenName, decimal, tokenAddr))
      .onEventRelay(handleSwapInCBridge(chainId, tokenName, decimal, tokenAddr))
  }
}


// ================================= Hop =================================
const handleSwapOutHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Hop", true)
  return async function (
    event: TransferSentEvent | TransferSentToL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapInHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Hop", false)
  return async function (
    event: WithdrawalBondedEthereumEvent | WithdrawalBondedL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

for (const [chainId, tokenList] of Object.entries(HopMap)) {
  if (Number(chainId) == 1) {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeEthereumProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSentToL2(handleSwapOutHop(chainId, tokenName, decimal))
        .onEventWithdrawalBonded(handleSwapInHop(chainId, tokenName, decimal))
    }
  } else {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSent(handleSwapOutHop(chainId, tokenName, decimal))
        .onEventWithdrawalBonded(handleSwapInHop(chainId, tokenName, decimal))
    }
  }
}


// ================================= Stargate =================================
const handleSwapOutStargate = function (chainId: string, tokenName: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Stargate", true)
  return async function (event: SwapEvent, ctx: StargatePoolContext) {
    var value = scaleDown(event.args.amountSD, 6)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice).dividedBy(1000000000000)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapInStargate = function (chainId: string, tokenName: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Stargate", false)
  return async function (event: SwapRemoteEvent, ctx: StargatePoolContext) {
    var value = scaleDown(event.args.amountSD, 6)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice).dividedBy(1000000000000)
    ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

for (const [chainId, tokenList] of Object.entries(StargateMap)) {
  for (const [tokenName, poolAddress, _] of tokenList) {
    StargatePoolProcessor.bind({ address: poolAddress, network: Number(chainId) })
      .onEventSwap(handleSwapOutStargate(chainId, tokenName))
      .onEventSwapRemote(handleSwapInStargate(chainId, tokenName))
  }
}


// ================================= AcrossTo =================================
const handleSwapOutAcrossOld = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", true)
  return async function (event: FundsDepositedEventOld, ctx: AcrossToOldContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapOutAcrossNew = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", true)
  return async function (event: FundsDepositedEventNew, ctx: AcrossToNewContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.originToken == tokenAddr) {
      ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

const handleSwapInAcrossOld = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", false)
  return async function (event: FilledRelayEventOld, ctx: AcrossToOldContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.destinationToken == tokenAddr) {
      ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

const handleSwapInAcrossNew = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", false)
  return async function (event: FilledRelayEventNew, ctx: AcrossToNewContext) {
    var value = scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.destinationToken == tokenAddr) {
      ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

for (const [chainId, [poolList, tokenList]] of Object.entries(AcrossMap)) {
  const [contractOld, contractNew] = poolList
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    AcrossToOldProcessor.bind({ address: contractOld, network: Number(chainId) })
      .onEventFundsDeposited(
        handleSwapOutAcrossOld(chainId, tokenName, decimal),
        AcrossToOldProcessor.filters.FundsDeposited(null, null, null, null, null, null, tokenAddr)
      )
      .onEventFilledRelay(
        handleSwapInAcrossOld(chainId, tokenName, decimal, tokenAddr)
      )
    AcrossToNewProcessor.bind({ address: contractNew, network: Number(chainId) })
      .onEventFundsDeposited(
        handleSwapOutAcrossNew(chainId, tokenName, decimal, tokenAddr)
      )
      .onEventFilledRelay(
        handleSwapInAcrossNew(chainId, tokenName, decimal, tokenAddr)
      )
  }
}