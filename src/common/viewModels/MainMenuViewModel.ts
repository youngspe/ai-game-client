import { BaseViewModel, ViewModel } from "./ViewModel";
import { GameModel } from "./GameModel";
import { Inject, LazyKey } from "checked-inject";
import { ApiClient, EventStream } from "../ApiClient";
import { ViewModelFactoryKey } from "../utils/ViewModelFactoryKey";
import { GameComponent } from "../GameData";

export class MainMenuViewModel extends BaseViewModel {
    private readonly _deps: MainMenuViewModel.Deps

    constructor(base: BaseViewModel.BaseDeps, deps: MainMenuViewModel.Deps) {
        super(base)
        this._deps = deps
    }

    override navBehavior: ViewModel.NavBehavior = 'unwind'
    async start(displayName: string) {
        const createRes = await this._deps.apiClient.createGame()
        if ('ok' in createRes) {
            await this.join(createRes.ok.gameId, displayName)
            return
        }

        throw new Error('TODO: error state')
    }
    async join(joinCode: string, displayName: string) {
        if ('ok' in await this._deps.apiClient.joinGame(joinCode, displayName)) {
            const streamRes = await this._deps.apiClient.getEventStream(joinCode)
            if ('ok' in streamRes) {
                this.navigate(this._deps.gameModel(streamRes.ok))
            }
            return
        }
        throw new Error('TODO: error state')
    }

}

export namespace MainMenuViewModel {
    export const Deps = LazyKey(() => ({
        apiClient: ApiClient,
        gameModel: GameComponent.Resolve(GameModel.Cyclic()),
    }))

    export interface Deps {
        apiClient: ApiClient
        gameModel: (stream: EventStream) => GameModel
    }

    export const Factory = class extends ViewModelFactoryKey(MainMenuViewModel, Deps) { private _: any }
}
