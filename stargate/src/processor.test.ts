import { TestProcessorServer, firstCounterValue } from '@sentio/sdk/lib/testing'
import { mockSwapLog } from './types/stargatepool/test-utils'
import { BigNumber } from 'ethers'

describe('Test Processor', () => {
  const service = new TestProcessorServer(() => require('./processor'))

  beforeAll(async () => {
    await service.start()
  })

  test('has valid config', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length > 0).toBeTruthy()
  })

  test('check transfer event handling', async () => {
    const resp = await service.testLog(
      // mockTransferLog('0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9', {
      //   from: '0x0000000000000000000000000000000000000000',
      //   to: '0xb329e39ebefd16f40d38f07643652ce17ca5bac1',
      //   value: BigNumber.from(10n ** 18n * 10n),
      // })

      // https://etherscan.io/tx/0xa53e714b52e634168e7338568634c96bc6d16eb2aeaf01ec90f4eb687ea8eda0
      mockSwapLog('0xdf0770df86a8034b3efef0a1bb3c889b8332ff56', {
        chainId: 9,
        dstPoolId: BigNumber.from(1),
        from: '0x9Da98Cc8e38cef116e3Db6C62e495A524400BA3e',
        amountSD: BigNumber.from(34979000000),
        eqReward: BigNumber.from(0),
        eqFee: BigNumber.from(1050000),
        protocolFee: BigNumber.from(4200000),
        lpFee: BigNumber.from(15750000),
      })
    )

    const tokenCounter = firstCounterValue(resp.result, 'token')
    expect(tokenCounter).toEqual(10n)
  })
})
