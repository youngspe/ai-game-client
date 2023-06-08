import { TokenStore } from "./TokenStore"

export interface ApiClient {
    createGame(): Promise<ApiResult>
}

export type ApiResult<T = unknown> = { ok: T } | { err: Response }

export class DefaultApiClient implements ApiClient {
    private readonly _baseUrl: string
    private readonly _tokenStore: TokenStore
    private _token: string | null = null

    constructor(baseUrl: string, tokenStore: TokenStore) {
        this._baseUrl = baseUrl
        this._tokenStore = tokenStore
    }

    async createGame(): Promise<ApiResult> {
        const res = await this._fetch('games', { method: 'POST' })
        if (!res.ok) return { err: res }
        return { ok: null }
    }

    private async _fetch(url: string, { headers, ...info }: RequestInit) {
        const newHeaders = new Headers(headers)
        const token = await this._initToken()

        if (typeof token != 'string') {
            return token ?? new Response(null, { status: 401 })
        }

        newHeaders.append('Authorization', `Bearer ${token}`)

        return await fetch(this._baseUrl + url, {
            headers: newHeaders,
            ...info
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