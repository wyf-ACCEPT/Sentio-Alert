import { BigNumber } from 'bignumber.js/bignumber';
import { chain, token } from '@sentio/sdk/lib/utils';
import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent, LogAnySwapInEvent } from './types/multichainrouter';
import { CBridgeContext, CBridgeProcessor, SendEvent, RelayEvent } from './types/cbridge';
import { HopBridgeContext, HopBridgeProcessor, TransferSentEvent, 
  WithdrawalBondedEvent as WithdrawalBondedL2Event  } from './types/hopbridge';
import { HopBridgeEthereumContext, HopBridgeEthereumProcessor, TransferSentToL2Event, 
  WithdrawalBondedEvent as WithdrawalBondedEthereumEvent } from './types/hopbridgeethereum';
import { StargatePoolContext, StargatePoolProcessor, SwapEvent, SwapRemoteEvent } from './types/stargatepool';
import { AcrossToContext, AcrossToProcessor, FundsDepositedEvent, FilledRelayEvent } from './types/acrossto';
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
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "src": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "src": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
  }
}

const handleSwapInMultichain = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: LogAnySwapInEvent, ctx: MultichainRouterContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge('swapInAmount').record(value, {
      "dst": chainName,
      "token": tokenName,
      "bridge": 'Multichain',
    })
    ctx.meter.Gauge('swapInType').record(1, {
      "type": mapOrder(value),
      "dst": chainName,
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
        .onEventLogAnySwapIn(
          handleSwapInMultichain(chainId, tokenName, decimal),
          MultichainRouterProcessor.filters.LogAnySwapIn(null, tokenAddr)
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
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('swapOutAmount').record(value, {
        "src": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
      ctx.meter.Gauge('swapOutType').record(1, {
        "type": mapOrder(value),
        "src": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
    }
  }
}

const handleSwapInCBridge = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: RelayEvent, ctx: CBridgeContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    if (event.args.token == tokenAddr) {
      ctx.meter.Gauge('swapInAmount').record(value, {
        "dst": chainName,
        "token": tokenName,
        "bridge": 'CBridge',
      })
      ctx.meter.Gauge('swapInType').record(1, {
        "type": mapOrder(value),
        "dst": chainName,
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
      .onEventRelay(handleSwapInCBridge(chainId, tokenName, decimal, tokenAddr))
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
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "src": chainName,
      "token": tokenName,
      "bridge": 'Hop',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "src": chainName,
      "token": tokenName,
      "bridge": 'Hop',
    })
  }
}

const handleSwapInHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (
    event: WithdrawalBondedEthereumEvent | WithdrawalBondedL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge('swapInAmount').record(value, {
      "dst": chainName,
      "token": tokenName,
      "bridge": 'Hop',
    })
    ctx.meter.Gauge('swapInType').record(1, {
      "type": mapOrder(value),
      "dst": chainName,
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
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SwapEvent, ctx: StargatePoolContext) {
    var value = token.scaleDown(event.args.amountSD, 6)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice).dividedBy(1000000000000)
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "src": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "src": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
  }
}

const handleSwapInStargate = function (chainId: string, tokenName: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: SwapRemoteEvent, ctx: StargatePoolContext) {
    var value = token.scaleDown(event.args.amountSD, 6)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice).dividedBy(1000000000000)
    ctx.meter.Gauge('swapInAmount').record(value, {
      "dst": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
    ctx.meter.Gauge('swapInType').record(1, {
      "type": mapOrder(value),
      "dst": chainName,
      "token": tokenName,
      "bridge": 'Stargate',
    })
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
const handleSwapOutAcross = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: FundsDepositedEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge('swapOutAmount').record(value, {
      "src": chainName,
      "token": tokenName,
      "bridge": 'AcrossTo',
    })
    ctx.meter.Gauge('swapOutType').record(1, {
      "type": mapOrder(value),
      "src": chainName,
      "token": tokenName,
      "bridge": 'AcrossTo',
    })
  }
}

const handleSwapInAcross = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  return async function (event: FilledRelayEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == 'ETH') value = value.multipliedBy(EthPrice)
    if (event.args.destinationToken == tokenAddr) {
      ctx.meter.Gauge('swapInAmount').record(value, {
        "dst": chainName,
        "token": tokenName,
        "bridge": 'AcrossTo',
      })
      ctx.meter.Gauge('swapInType').record(1, {
        "type": mapOrder(value),
        "dst": chainName,
        "token": tokenName,
        "bridge": 'AcrossTo',
      })
    }
  }
}

for (const [chainId, [poolAddr, tokenList]] of Object.entries(AcrossMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    AcrossToProcessor.bind({ address: poolAddr, network: Number(chainId) })
      .onEventFundsDeposited(
        handleSwapOutAcross(chainId, tokenName, decimal),
        AcrossToProcessor.filters.FundsDeposited(null, null, null, null, null, null, tokenAddr)
      )
      .onEventFilledRelay(
        handleSwapInAcross(chainId, tokenName, decimal, tokenAddr)
      )
  }
}