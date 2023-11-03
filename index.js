import {ok} from 'node:assert/strict'
import EventEmitter from 'node:events'
import {
  availableParallelism, cpus, freemem, loadavg, totalmem, uptime
} from 'os'

import mediasoup from 'mediasoup'
import pidusage from 'pidusage'


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

    mediasoup.observer.on('newworker', this.#onNewWorker)

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


  async getStats()
  {
    ok(this.#connected, 'Remote Mediasoup client is not connected')

    const pidusages = this.#workersPids?.length
      ? await pidusage(this.#workersPids)
      : undefined

    return {
      os: {
        availableParallelism: availableParallelism(),
        cpus: cpus(),
        freemem: freemem(),
        loadavg: loadavg(),
        totalmem: totalmem(),
        uptime: uptime()
      },
      pidusages,
      process: {
        constrainedMemory: process.constrainedMemory(),
        cpuUsage: process.cpuUsage(),
        hrtime: process.hrtime.bigint(),
        memoryUsage: process.memoryUsage(),
        resourceUsage: process.resourceUsage(),
        uptime: process.uptime()
      }
    }
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
  #url
  #workersPids = []

  #onConnected = () =>
  {
    this.#connected = true
    this.emit('connected')
  }

  #onOpen = this.emit.bind(this, 'open')

  #onNewWorker = worker =>
  {
    const {observer, pid} = worker

    const workersPids = this.#workersPids

    if(workersPids.includes(pid)) return

    workersPids.push(pid)

    observer.once('close', function()
    {
      const index = workersPids.indexOf(pid)

      if(index !== -1) workersPids.splice(index, 1)
    })
  }

  #onWebsocketOpen = this.emit.bind(this, 'websocketOpen')
}
