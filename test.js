import {deepStrictEqual} from 'node:assert/strict'
import {test} from 'node:test'

import RemoteMediasoupClientMock from '@mafalda-sfu/remote-mediasoup-client-mock'


test('layout', function()
{
  deepStrictEqual(typeof RemoteMediasoupClientMock, 'function')
})
