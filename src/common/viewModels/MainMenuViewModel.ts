import { BaseViewModel, ViewModel } from "./ViewModel";
import { GameModel } from "./GameModel";
import { FactoryKey } from "checked-inject";
import { ApiClient } from "../ApiClient";

export default class MainMenuViewModel extends BaseViewModel {
    private readonly _apiClient: ApiClient

    constructor(base: BaseViewModel.Deps, apiClient: ApiClient) {
        super(base)
        this._apiClient = apiClient
    }

    override navBehavior: ViewModel.NavBehavior = 'unwind'
    async start(displayName: string) {
        const createRes = await this._apiClient.createGame()
        if ('ok' in createRes) {
            await this.join(createRes.ok.gameId, displayName)
            return
        }

        throw new Error('TODO: error state')
    }
    async join(joinCode: string, displayName: string) {
        if ('ok' in await this.deps.apiClient.joinGame(joinCode, displayName)) {
            const streamRes = await this.deps.apiClient.getEventStream(joinCode)
            if ('ok' in streamRes) {
                this.navigate(GameModel, streamRes.ok)
            }
            return
        }
        throw new Error('TODO: error state')
    }

    static Factory = class extends FactoryKey({
        base: BaseViewModel.Deps,
        api: ApiClient,
    }, ({ base, api }) => new this(base, api)) { private _: any }
}
