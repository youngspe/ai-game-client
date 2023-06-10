import { GameState, PlayerInfo, PlayerState } from "../../proto/GameState";
import { Reactive } from "../utils/Reactive";
import { StateObservable } from "../utils/rxUtils";
import { BaseViewModel } from "./ViewModel";

export class LobbyViewModel extends BaseViewModel {
    readonly args: LobbyViewModel.Args

    constructor(deps: BaseViewModel.Deps, props: LobbyViewModel.Args) {
        super(deps)
        this.args = props
    }
    cancel() { this.goBack() }
}

export namespace LobbyViewModel {
    export interface Args {

        state: Reactive<{
            gameState?: GameState
            playerState?: PlayerState
        }>
    }
}
