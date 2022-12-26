import { CurveContext, CurveProcessor } from "./types/curve"
import { Curve_wbtcContext, Curve_wbtcProcessor } from "./types/curve_wbtc"
import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { Gauge, Counter } from "@sentio/sdk"

const START_BLOCK_FOR_TEST = 15000000

const group_1 = ['busd', 'frax']
const group_2 = ['mim', 'usdd', 'lusd', 'tusd']

const CurvePoolAddress: { [index: string]: string } = {
  'steth': '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  'wbtc': '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
  'crv3': '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  'busd': '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
  'frax': '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  'mim': '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
  'usdd': '0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea',
  'lusd': '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
  'tusd': '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
}

const tableDict: { [index: string]: Gauge } = {
  'steth_price': Gauge.register('stETH_price', {
    description: 'Price of ETH-stETH pool token.',
    unit: 'stETH',
  }),
  'steth_pool': Gauge.register('stETH_liquidity', {
    description: 'Pool liquidity of ETH-stETH pool.',
    unit: 'stETH',
  }),
  'crv3_pool': Gauge.register('crv3_liquidity', {
    description: 'Pool liquidity of DAI-USDC-USDT pool.',
    unit: 'crv3',
  }),
  'crv3_price': Gauge.register('crv3_price', {
    description: 'Price of DAI-USDC-USDT pool token.',
    unit: 'crv3',
  }),
  'busd_frax_pool_percentage': Gauge.register('busd_frax_liquidity_precent'),
  'busd_frax_price': Gauge.register('busd_frax_price'),
  'other_pool': Gauge.register('other_pool'),
  'other_price': Gauge.register('other_price'),
  'wbtc_pool': Gauge.register('wbtc_liquidity'),
  'wbtc_price': Gauge.register('wbtc_price'),
}


// ============================== Stable coins ==============================
CurveProcessor.bind({ address: CurvePoolAddress.crv3, startBlock: START_BLOCK_FOR_TEST })
  .onBlock(async function (_: any, ctx: CurveContext) {
    const balanceDAI = scaleDown(await ctx.contract.balances(0), 18)
    const balanceUSDC = scaleDown(await ctx.contract.balances(1), 6)
    const balanceUSDT = scaleDown(await ctx.contract.balances(2), 6)
    tableDict.crv3_pool.record(ctx, balanceDAI, { "token": "DAI" })
    tableDict.crv3_pool.record(ctx, balanceUSDC, { "token": "USDC" })
    tableDict.crv3_pool.record(ctx, balanceUSDT, { "token": "USDT" })
    const priceDAI = scaleDown(await ctx.contract.get_dy(0, 1, 10n ** 18n), 6)
    const priceUSDC = scaleDown(await ctx.contract.get_dy(1, 2, 10n ** 6n), 6)
    const priceUSDT = scaleDown(await ctx.contract.get_dy(2, 0, 10n ** 6n), 18)
    tableDict.crv3_price.record(ctx, priceDAI, { "token": "DAI_in_USDC" })
    tableDict.crv3_price.record(ctx, priceUSDC, { "token": "USDC_in_USDT" })
    tableDict.crv3_price.record(ctx, priceUSDT, { "token": "USDT_in_DAI" })
  })

group_1.forEach(coin => {
  CurveProcessor.bind({ address: CurvePoolAddress[coin], startBlock: START_BLOCK_FOR_TEST })
    .onBlock(async function (_: any, ctx: CurveContext) {
      const balanceCoin = scaleDown(await ctx.contract.balances(0), 18).toNumber()
      const balance3crv = scaleDown(await ctx.contract.balances(1), 18).toNumber()
      tableDict.busd_frax_pool_percentage.record(
        ctx, balanceCoin / (balance3crv + balanceCoin), { "token": coin.toUpperCase() }
      )
      const priceCoin = scaleDown((await ctx.contract.get_dy_underlying(0, 2, 10n ** 18n)), 6)
      tableDict.busd_frax_price.record(ctx, priceCoin, { "token": coin.toUpperCase() + '_in_USDC' })
    })
})

group_2.forEach(coin => {
  CurveProcessor.bind({ address: CurvePoolAddress[coin], startBlock: START_BLOCK_FOR_TEST })
    .onBlock(async function (_: any, ctx: CurveContext) {
      const balanceCoin = scaleDown(await ctx.contract.balances(0), 18).toNumber()
      const balance3crv = scaleDown(await ctx.contract.balances(1), 18).toNumber()
      tableDict.other_pool.record(
        ctx, balanceCoin / (balance3crv + balanceCoin), { "token": coin.toUpperCase() }
      )
      const priceCoin = scaleDown((await ctx.contract.get_dy_underlying(0, 2, 10n ** 18n)), 6)
      tableDict.other_price.record(ctx, priceCoin, { "token": coin.toUpperCase() + '_in_USDC' })
    })
})


// ============================== ETH & stETH ==============================
CurveProcessor.bind({ address: CurvePoolAddress.steth, startBlock: START_BLOCK_FOR_TEST })
  .onBlock(async function (_: any, ctx: CurveContext) {
    const balanceETH = scaleDown(await ctx.contract.balances(0), 18)
    const balanceStETH = scaleDown(await ctx.contract.balances(1), 18)
    tableDict.steth_pool.record(ctx, balanceETH, { "token": "ETH" })
    tableDict.steth_pool.record(ctx, balanceStETH, { "token": "stETH" })
    const priceStETH = scaleDown((await ctx.contract.get_dy(1, 0, 10n ** 18n)), 18)
    tableDict.steth_price.record(ctx, priceStETH, { "token": "stETH_in_ETH" })
  })


// ===================== renBTC & Wrapped BTC & Synth sBTC =====================
Curve_wbtcProcessor.bind({ address: CurvePoolAddress.wbtc, startBlock: START_BLOCK_FOR_TEST })
  .onBlock(async function (_: any, ctx: Curve_wbtcContext) {
    const balanceR = scaleDown(await ctx.contract.balances(0), 8)
    const balanceW = scaleDown(await ctx.contract.balances(1), 8)
    const balanceS = scaleDown(await ctx.contract.balances(2), 18)
    tableDict.wbtc_pool.record(ctx, balanceR, { "token": "rBTC" })
    tableDict.wbtc_pool.record(ctx, balanceW, { "token": "WBTC" })
    tableDict.wbtc_pool.record(ctx, balanceS, { "token": "sBTC" })
    const priceR = scaleDown(await ctx.contract.get_dy(0, 1, 10n ** 8n), 8)
    const priceW = scaleDown(await ctx.contract.get_dy(1, 2, 10n ** 8n), 18)
    const priceS = scaleDown(await ctx.contract.get_dy(2, 0, 10n ** 18n), 8)
    tableDict.wbtc_price.record(ctx, priceR, { "token": "rBTC_in_WBTC" })
    tableDict.wbtc_price.record(ctx, priceW, { "token": "WBTC_in_sBTC" })
    tableDict.wbtc_price.record(ctx, priceS, { "token": "sBTC_in_rBTC" })
  })

