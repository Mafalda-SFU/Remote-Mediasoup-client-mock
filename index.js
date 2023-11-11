import {ok} from 'node:assert/strict'
import EventEmitter from 'node:events'

import mediasoupGetStatsFactory from '@mafalda-sfu/mediasoup-getstats-factory'
import mediasoup from 'mediasoup'


/**
 * @see
 * {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState#value}
 */
const OPEN = 1
/**
 * @see
 * {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState#value}
 */
const CLOSED = 3
/**
 * Additional state to the WebSocket connection
 * [readyState]{@link
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState#value}
 * property to indicate that the
 * [Remote Mediasoup server]{@link https://mafalda.io/Remote-Mediasoup-server/}
 * payload with its internal state has been received and sync'ed, and so the
 * `Remote Mediasoup` connection has been fully established.
 *
 * @type {number}
 *
 * @constant
 *
 * @default
 */
const CONNECTED = 4


/**
 * @summary Remote Mediasoup client mock class
 *
 * @class RemoteMediasoupClientMock
 *
 * @augments {EventEmitter}
 *
 * @date 30/04/2023
 *
 * @see
 * {@link https://mafalda.io/Remote-Mediasoup-client/API#RemoteMediasoupClient
 * Remote Mediasoup client}
 *
 * @export
 *
 * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
 */
export default class RemoteMediasoupClientMock extends EventEmitter
{
  /**
   * @summary Creates an instance of {@link RemoteMediasoupClientMock}.
   *
   * @class
   *
   * @memberof RemoteMediasoupClientMock
   *
   * @param {string|object} [url] URL of the
   * [Remote Mediasoup server](https://mafalda.io/Remote-Mediasoup-server/). If
   * it's not provided, the {@link RemoteMediasoupClientMock} object will remain
   * in closed state.
   * @param {object} [WebSocket] WebSocket class to be used to create the
   * connections with the
   * [Remote Mediasoup server](https://mafalda.io/Remote-Mediasoup-server/)
   *
   * @date 30/04/2023
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
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
   * This object is API compatible with the
   * [Mediasoup API](https://mediasoup.org/documentation/v3/mediasoup/api/)
   * provided by the
   * [`Mediasoup` package](https://www.npmjs.com/package/mediasoup).
   *
   * @summary Get a reference to the `mediasoup` package exported object.
   *
   * @readonly
   * @memberof RemoteMediasoupClientMock
   *
   * @date 30/04/2023
   *
   * @see {@link https://mediasoup.org/documentation/v3/mediasoup/api/}
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   */
  get mediasoup()
  {
    return this.#connected ? mediasoup : undefined
  }

  /**
   * In addition of the states defined for the WebSocket connection
   * [readyState]{@link
   * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState#value}
   * property, this property can have a ['connected' state]{@link CONNECTED}
   * to indicate that the
   * [Remote Mediasoup server](https://mafalda.io/Remote-Mediasoup-server/)
   * payload with its internal state has been received and sync'ed, and so the
   * `Remote Mediasoup` connection has been fully established.
   *
   * @summary Get the current `readyState` of the client.
   *
   * @readonly
   * @memberof RemoteMediasoupClientMock
   *
   * @date 30/04/2023
   *
   * @see
   * {@link
   * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState}
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   */
  get readyState()
  {
    if(this.#connected) return CONNECTED

    return this.#closed ? CLOSED : OPEN
  }


  getStats = async () =>
  {
    ok(this.#mediasoupGetStats, 'Remote Mediasoup client is not connected')

    return this.#mediasoupGetStats.getStats()
  }


  //
  // Remote Mediasoup client API
  //

  /**
   * If it's already closed, this method does nothing
   *
   * @summary Close the client.
   *
   * @memberof RemoteMediasoupClientMock
   *
   * @date 30/04/2023
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
   */
  close()
  {
    if(this.#closed) return

    this.#closed = true
    this.#connected = false

    this.#mediasoupGetStats.close()
    this.#mediasoupGetStats = undefined

    // Notify client is closed
    this.emit('close')

    // We don't emit the 'disconnected' and `websocketClose` events because it's
    // us who are closing the client, not the server
  }

  /**
   * If it's already open, it will throw an exception
   *
   * @summary Open the client to the given URL.
   *
   * @memberof RemoteMediasoupClientMock
   *
   * @param {string} [url] URL of the
   * [Remote Mediasoup server](https://mafalda.io/Remote-Mediasoup-server/). If
   * not provided, it will re-open the connection to the last provided URL, and
   * if was not provided, it will throw an exception
   *
   * @returns {RemoteMediasoupClientMock}
   *
   * @date 30/04/2023
   *
   * @author Jesús Leganés-Combarro 'piranna' <piranna@gmail.com>
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
  #mediasoupGetStats
  #url


  #onConnected = () =>
  {
    this.#connected = true
    this.#mediasoupGetStats = mediasoupGetStatsFactory(mediasoup)
    this.emit('connected')
  }

  #onOpen = this.emit.bind(this, 'open')

  #onWebsocketOpen = this.emit.bind(this, 'websocketOpen')
}
