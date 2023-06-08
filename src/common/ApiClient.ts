import { Subject } from "rxjs"
import { ClientEvent, ServerEvent } from "../proto/Event"
import { TokenStore } from "./TokenStore"
import { asyncValues } from "./utils/rxUtils"

export type ApiResult<T = unknown> = { ok: T } | { err: Response }

export interface ApiClient {
    createGame(): Promise<ApiResult<{ gameId: string }>>
    joinGame(gameId: string): Promise<ApiResult>
}

const joinUriPath = (...parts: string[]) => parts.map(encodeURIComponent).join('/')

export class DefaultApiClient implements ApiClient {
    private readonly _baseUrl: string
    private readonly _tokenStore: TokenStore
    private _token: string | null = null

    constructor(baseUrl: string, tokenStore: TokenStore) {
        this._baseUrl = baseUrl
        this._tokenStore = tokenStore
    }

    async createGame(): Promise<ApiResult<{ gameId: string }>> {
        const res = await this._fetch('games', { method: 'POST' })
        if (!res.ok) return { err: res }
        const gameId = (await res.json()).gameId
        return { ok: { gameId } }
    }

    async joinGame(gameId: string): Promise<ApiResult> {
        const res = await this._fetch(joinUriPath('games', gameId, 'players'), { method: 'POST' })
        if (!res.ok) return { err: res }
        return { ok: null }
    }

    private async _fetch(url: string, { headers, ...init }: RequestInit) {
        const newHeaders = new Headers(headers)
        const token = await this._initToken()

        if (typeof token != 'string') {
            return token ?? new Response(null, { status: 401 })
        }

        newHeaders.append('Authorization', `Bearer ${token}`)

        return await fetch(this._baseUrl + url, {
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

        const res = await fetch(this._baseUrl + 'session', { method: 'POST' })
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
    recv(): AsyncIterableIterator<ServerEvent>
    close(): void
}

export class DefaultEventStream implements EventStream {
    private _ws: WebSocket | null = null
    private _subject = new Subject<ServerEvent>
    private readonly _baseUrl: string
    private _outBuf: ClientEvent[] = []
    private readonly _gameId: string

    constructor(baseUrl: string, gameId: string) {
        this._baseUrl = baseUrl
        this._gameId = gameId
    }

    async init() {
        while (true) {
            const ws = new WebSocket(this._baseUrl + joinUriPath('games', this._gameId, 'events'))
            const success = await new Promise<boolean>(res => {
                ws.onopen = () => res(true)
                ws.onerror = () => res(false)
            })
            ws.onopen = null
            ws.onerror = null
            ws.onclose = () => {
                ws.onclose = null
                ws.onmessage = null
                this._ws = null
                this.init()
            }

            if (success) {
                this._ws = ws
                ws.send(JSON.stringify(this._outBuf))
                this._outBuf = []
                break
            }
        }
    }

    send(...events: ClientEvent[]) {
        if (this._ws == null || this._ws.readyState <= WebSocket.OPEN) {
            this._outBuf.push(...events)
        } else {
            this._ws.send(JSON.stringify(events))
        }
    }

    recv() {
        return asyncValues(this._subject)
    }
}
