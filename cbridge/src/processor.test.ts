import { TestProcessorServer, firstGaugeValue } from '@sentio/sdk/lib/testing'
import { mockRelayLog } from './types/cbridge/test-utils'
import { BigNumber } from 'ethers'

describe('Test Processor', () => {
  const service = new TestProcessorServer(() => require('./processor'))

  beforeAll(async () => {
    await service.start()
  })

  // test('has config', async () => {
  //   const config = await service.getConfig({})
  //   expect(config.contractConfigs.length > 0)
  // })
  
  test('check relay event handling', async () => {
    const resp = await service.testLog(
      mockRelayLog('0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820', {
        sender: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
        receiver: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
        amount: BigNumber.from(10n ** 18n),
        srcChainId: BigNumber.from(1n),
        transferId: 'de976e48b71329170f7ec9331eb7526df59ba01abd9a74874b7693bbb8c50dfe',
        token: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
        srcTransferId: 'f9097b4c7ae46f388be8928917c1f4984f130eedd5b314364ee75495d397b38b',
      })
    )
  })

})
