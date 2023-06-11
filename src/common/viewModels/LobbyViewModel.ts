import { GameState, PlayerInfo, PlayerState } from "../../proto/GameState";
import { EventStream } from "../ApiClient";
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

    start() {
        this.args.stream.send({ event: "start" })
    }
}

export namespace LobbyViewModel {
    export interface Args {
        state: Reactive<{
            gameState?: GameState
            playerState?: PlayerState
        }>
        stream: EventStream
    }
}
