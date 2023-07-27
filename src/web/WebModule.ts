import { Module, Inject, Singleton } from "checked-inject";
import { TokenStore } from "../common/TokenStore";
import { CommonKeys, CommonModule, HistoryManager, WindowManager } from "../common/CommonModule";

class WebTokenStore extends TokenStore {
    private _storage: Storage

    constructor(storage: Storage) {
        super();
        this._storage = storage
    }

    load() {
        return this._storage.getItem('aiGameClient/token')
    }

    store(token: string) {
        this._storage.setItem('aiGameClient/token', token)
    }
    static scope = Singleton
    static inject = Inject.call(() => new WebTokenStore(localStorage))
}

class WebHistoryManager extends HistoryManager {
    private _history: History

    constructor(history: History) {
        super()
        this._history = history
    }

    init() {
        if (this._history.state != 'DEFAULT') {
            this._history.replaceState('BACK', '')
            this._history.pushState('DEFAULT', '')
        }
    }

    exit() {
        if (this._history.length > 2) {
            this._history.go(-2)
        }
    }

    popState(state: string) {
        if (state == 'BACK') {
            this._history.pushState('DEFAULT', '')
            this.onBackListener?.()
        }
    }

    static scope = Singleton
    static inject = Inject.call(() => new WebHistoryManager(history))
}

export class WebWindowManager extends WindowManager {
    setBackground(color: string): void {
        document.body.style.backgroundColor = color
    }
    static scope = Singleton
    static inject = Inject.construct(this)
}

export abstract class WebApp {
    abstract initApp(): void
}

export const WebModule = Module(ct => ct
    .bind(TokenStore, WebTokenStore)
    .bind(HistoryManager, WebHistoryManager)
    .bind(WindowManager, WebWindowManager)
    .provideInstance(CommonKeys.BaseUrls, {
        baseUrlHttp: `${location.protocol}//${location.host}/api/`,
        baseUrlWs: `${location.protocol == 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/`,
    })
    .provide(WebApp, {
        historyManager: WebHistoryManager,
    }, ({ historyManager }) => new class extends WebApp {
        initApp(): void {
            historyManager.init()
            addEventListener('popstate', ({ state }) => historyManager.popState(state))
        }
    }())
)

export const WebAppModule = Module(CommonModule, WebModule)
