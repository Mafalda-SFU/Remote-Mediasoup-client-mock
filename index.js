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
    return this.#connected ? mediasoup : undefined
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
    return this.#connected
      ? 4
      : this.#closed
        ? 3
        : 1
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
    if(this.#closed) return

    this.#closed = true
    this.#connected = false

    // Notify client is closed
    this.emit('close')

    // We don't emit the 'disconnected' and `websocketClose` events because it's
    // us who are closing the client, not the server
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
    ok(this.#closed, `${this.constructor.name} is already open(ing)`)

    // If `url` argument is not provided, allow to reopen the client to the same
    // previous URL by default
    url ??= this.#url

    ok(url, 'url not defined')

    setImmediate(this.#onOpen)
    setImmediate(this.#onWebsocketOpen)
    setImmediate(this.#onConnected)

    this.#closed = false
    this.#url = url

    return this
  }


  //
  // Private API
  //

  #closed = true
  #connected = false
  #url

  #onConnected = () =>
  {
    this.#connected = true
    this.emit('connected')
  }

  #onOpen = this.emit.bind(this, 'open')
  #onWebsocketOpen = this.emit.bind(this, 'websocketOpen')
}
