import {once} from 'node:events';

import mediasoupNodeTests from '@mafalda-sfu/mediasoup-node-tests'
import RemoteMediasoupClientMock from '@mafalda-sfu/remote-mediasoup-client-mock'


// eslint-disable-next-line jest/no-hooks
afterAll(function()
{
  remoteMediasoupClientMock.close()
})


test('layout', function()
{
  expect.assertions(1)

  expect(RemoteMediasoupClientMock).toMatchInlineSnapshot('[Function]')
})

test('lifecycle', async function()
{
  expect.assertions(8)

  remoteMediasoupClientMock = new RemoteMediasoupClientMock({WebSocket: {}})

  expect(remoteMediasoupClientMock.mediasoup).toBeUndefined()
  expect(remoteMediasoupClientMock.readyState).toBe(3)

  remoteMediasoupClientMock.open('ws://example.com')

  expect(remoteMediasoupClientMock.mediasoup).toBeUndefined()
  expect(remoteMediasoupClientMock.readyState).toBe(1)

  await once(remoteMediasoupClientMock, 'connected')

  expect(remoteMediasoupClientMock.mediasoup).toBeDefined()
  expect(remoteMediasoupClientMock.readyState).toBe(4)

  remoteMediasoupClientMock.close()

  expect(remoteMediasoupClientMock.mediasoup).toBeUndefined()
  expect(remoteMediasoupClientMock.readyState).toBe(3)
})


// eslint-disable-next-line jest/require-hook
let remoteMediasoupClientMock = new RemoteMediasoupClientMock(
  'ws://example.com'
)

await once(remoteMediasoupClientMock, 'connected')

// eslint-disable-next-line jest/require-hook
mediasoupNodeTests(remoteMediasoupClientMock.mediasoup)
