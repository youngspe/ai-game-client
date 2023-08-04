import { Inject, LazyKey, Target } from "checked-inject";
import { GameState, PlayerInfo, PlayerState } from "../../proto/GameState";
import { EventStream } from "../ApiClient";
import { Reactive } from "../utils/Reactive";
import { ViewModelFactoryKey } from "../utils/ViewModelFactoryKey";
import { StateObservable } from "../utils/rxUtils";
import { BaseViewModel } from "./ViewModel";
import { GameData } from "../GameData";

export class LobbyViewModel extends BaseViewModel {
    private readonly _deps: LobbyViewModel.Deps
    get state() { return this._deps.state }

    constructor(base: BaseViewModel.BaseDeps, deps: LobbyViewModel.Deps) {
        super(base)
        this._deps = deps
    }

    cancel() { this.goBack() }

    start() {
        this._deps.stream.send({ event: "start" })
    }
}

export namespace LobbyViewModel {
    export const Deps = LazyKey(() => ({
        state: GameData.State,
        stream: GameData.Stream,
    }))
    
    export type Deps = Target<typeof Deps>
    export class Factory extends ViewModelFactoryKey(LobbyViewModel, Deps) { private _: any }
}
