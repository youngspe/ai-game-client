import { BaseViewModel, ViewModel } from "./ViewModel";
import { GameModel } from "./GameModel";

export class MainMenuViewModel extends BaseViewModel {
    override navBehavior: ViewModel.NavBehavior = 'unwind'
    async start(displayName: string) {
        const createRes = await this.deps.apiClient.createGame()
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
}
