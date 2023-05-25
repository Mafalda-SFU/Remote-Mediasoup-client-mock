import {ok} from 'node:assert/strict'
import EventEmitter from 'node:events'

import mediasoup from 'mediasoup'

/**
 * Connection mock class
 *
 * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
 * @date 30/04/2023
 * @export
 * @class RemoteMediasoupClientMock
 * @extends {EventEmitter}
 */
export default class RemoteMediasoupClientMock extends EventEmitter
{
  /**
   * Creates an instance of RemoteMediasoupClientMock.
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   * @date 30/04/2023
   * @param {string|object} [url]
   * @param {object} [WebSocket]
   * @memberof RemoteMediasoupClientMock
   */
  constructor(url, WebSocket)
  {
    if(url && typeof url !== 'string') ({WebSocket, url} = url)

    // eslint-disable-next-line no-console
    if(WebSocket) console.debug('Websocket class not used in mock')

    super()

    if(url) this.open(url)
  }


  //
  // Remote Mediasoup common interface
  //

  /**
   * Get a reference to the `mediasoup` package exported object.
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   * @date 30/04/2023
   * @readonly
   * @memberof RemoteMediasoupClientMock
   */
  get mediasoup()
  {
    return this.#open ? mediasoup : undefined
  }

  /**
   * Get the current `readyState` of the client.
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   * @date 30/04/2023
   * @readonly
   * @memberof RemoteMediasoupClientMock
   */
  get readyState()
  {
    return this.#open ? 4 : 3
  }


  //
  // Remote Mediasoup client API
  //

  /**
   * Close the client.
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   * @date 30/04/2023
   * @memberof RemoteMediasoupClientMock
   */
  close()
  {
    this.#open = false

    // Notify client is closed
    this.emit('close')

    setImmediate(this.#onDisconnected)
    setImmediate(this.#onWebsocketClose)
  }

  /**
   * Open the client to the given URL.
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   * @date 30/04/2023
   * @param {string} [url]
   * @return {RemoteMediasoupClientMock}
   * @memberof RemoteMediasoupClientMock
   */
  open(url)
  {
    ok(!this.#open, `${this.constructor.name} is already open(ing)`)

    // If `url` argument is not provided, allow to reopen the client to the same
    // previous URL by default
    url ??= this.#url

    ok(url, 'url not defined')

    setImmediate(this.#onOpen)
    setImmediate(this.#onWebsocketOpen)
    setImmediate(this.#onConnected)

    this.#open = true
    this.#url = url

    return this
  }


  //
  // Private API
  //

  #open
  #url

  #onConnected = this.emit.bind(this, 'connected')
  #onDisconnected = this.emit.bind(this, 'disconnected')
  #onOpen = this.emit.bind(this, 'open')
  #onWebsocketClose = this.emit.bind(this, 'websocketClose')
  #onWebsocketOpen = this.emit.bind(this, 'websocketOpen')
}
