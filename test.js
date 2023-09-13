import {once} from 'node:events';

import mediasoupNodeTests from '@mafalda-sfu/mediasoup-node-tests'
import RemoteMediasoupClientMock from '@mafalda-sfu/remote-mediasoup-client-mock'


test('layout', function()
{
  expect.assertions(1)

  expect(RemoteMediasoupClientMock).toMatchInlineSnapshot('[Function]')
})


const remoteMediasoupClientMock = new RemoteMediasoupClientMock('ws://example.com')

await once(remoteMediasoupClientMock, 'connected')

// eslint-disable-next-line jest/require-hook
mediasoupNodeTests(remoteMediasoupClientMock.mediasoup)
