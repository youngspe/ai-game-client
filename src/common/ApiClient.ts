import { Observable, Subject, concat, of } from "rxjs"
import { ClientEvent, ServerEvent } from "../proto/Event"
import { TokenStore } from "./TokenStore"
import { asyncValues } from "./utils/rxUtils"

export type ApiResult<T = unknown> = { ok: T } | { err: Response }

export interface ApiClient {
    createGame(): Promise<ApiResult<{ gameId: string }>>
    joinGame(gameId: string, displayName: string): Promise<ApiResult>
    getEventStream(gameId: string): Promise<ApiResult<EventStream>>
}

const joinUriPath = (...parts: string[]) => parts.map(encodeURIComponent).join('/')

export class DefaultApiClient implements ApiClient {
    private readonly _baseUrlHttp: string
    private readonly _baseUrlWs: string
    private readonly _tokenStore: TokenStore
    private _token: string | null = null

    constructor(baseUrlHttp: string, baseUrlWs: string, tokenStore: TokenStore) {
        this._baseUrlHttp = baseUrlHttp
        this._baseUrlWs = baseUrlWs
        this._tokenStore = tokenStore
    }

    async createGame(): Promise<ApiResult<{ gameId: string }>> {
        const res = await this._fetch('games', { method: 'POST' })
        if (!res.ok) return { err: res }
        const gameId = (await res.json()).gameId
        return { ok: { gameId } }
    }

    async joinGame(gameId: string, displayName: string): Promise<ApiResult> {
        const res = await this._fetch(
            joinUriPath('games', gameId, 'players') + '?' + new URLSearchParams({ displayName }),
            { method: 'POST' },
        )
        if (!res.ok) return { err: res }
        return { ok: null }
    }

    async getEventStream(gameId: string): Promise<ApiResult<EventStream>> {
        const token = await this._initToken()
        if (typeof token != 'string') return { err: token ?? new Response(null, { status: 401 }) }
        const stream = new DefaultEventStream(this._baseUrlWs, gameId, token)
        await stream.init()
        return { ok: stream }
    }

    private async _fetch(url: string, { headers, ...init }: RequestInit) {
        const newHeaders = new Headers(headers)
        const token = await this._initToken()

        if (typeof token != 'string') {
            return token ?? new Response(null, { status: 401 })
        }

        newHeaders.append('Authorization', `Bearer ${token}`)

        return await fetch(this._baseUrlHttp + url, {
            headers: newHeaders,
            ...init
        })
    }

    private async _initToken(): Promise<string | null | Response> {
        if (this._token != null) return this._token
        let token = this._tokenStore.load()

        if (token != null) {
            this._token = token
            return token
        }

        const res = await fetch(this._baseUrlHttp + 'session', { method: 'POST' })
        if (!res.ok) return null

        token = (await res.json()).token ?? null

        if (token != null) {
            this._token = token
            this._tokenStore.store(token)
        }

        return token
    }
}


export interface EventStream {
    send(...events: ClientEvent[]): void
    recv(): Observable<ServerEvent>
    close(): void
}

export class DefaultEventStream implements EventStream {
    private _ws: WebSocket | null = null
    private _subject?: Subject<ServerEvent>
    private readonly _baseUrl: string
    private _outBuf: ClientEvent[] = []
    private _inBuf: ServerEvent[] = []
    private readonly _gameId: string
    private _closed = false
    private readonly _token: string
    private _retryInterval = 100
    get closed() { return this._closed }

    constructor(baseUrl: string, gameId: string, token: string) {
        this._baseUrl = baseUrl
        this._gameId = gameId
        this._token = token
    }

    async init() {
        while (!this._closed) {
            const ws = new WebSocket(this._baseUrl + joinUriPath('games', this._gameId, 'events') + '?' + new URLSearchParams({
                authToken: this._token,
            }))
            const success = await new Promise<boolean>(res => {
                ws.onopen = () => res(true)
                ws.onerror = ws.onclose = () => res(false)
            })
            ws.onopen = null
            ws.onerror = null
            ws.onclose = null

            if (success) {
                ws.onclose = async () => {
                    ws.onclose = null
                    ws.onmessage = null
                    this._ws = null

                    await new Promise(res => setTimeout(res, this._retryInterval))
                    if (!this._closed) {
                        this.init()
                    }
                }
                this._ws = ws
                ws.onmessage = e => {
                    const events: ServerEvent[] = JSON.parse(e.data)
                    events.forEach(e => {
                        if (this._subject) {
                            this._subject.next(e)
                        } else {
                            this._inBuf.push(e)
                        }
                    })
                }
                if (this._outBuf.length > 0) {
                    ws.send(JSON.stringify(this._outBuf))
                }
                this._outBuf = []
                break
            }
            await new Promise(res => setTimeout(res, this._retryInterval))
            this._retryInterval *= 2
        }

        this._retryInterval = Math.max(Math.min(this._retryInterval * 0.75, 10_000), 100)
    }

    send(...events: ClientEvent[]) {
        if (this._ws == null || this._ws.readyState < WebSocket.OPEN) {
            this._outBuf.push(...events)
        } else {
            this._ws.send(JSON.stringify(events))
        }
    }

    recv() {
        this._subject = new Subject()
        const inBuf = this._inBuf
        this._inBuf = []
        return concat(
            of(...inBuf),
            this._subject.asObservable(),
        )
    }

    close() {
        // TODO: handle recv and send when closed == true?
        this._closed = true
        this._subject?.complete()
    }
}
