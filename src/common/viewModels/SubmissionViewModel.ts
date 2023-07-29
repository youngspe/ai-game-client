import { BaseViewModel } from "./ViewModel";
import { ViewModelFactoryKey } from "../utils/ViewModelFactoryKey";
import { GameData } from "../GameData";
import { Inject, Target } from "checked-inject";

export class SubmissionViewModel extends BaseViewModel {
    private readonly _deps: SubmissionViewModel.Deps;

    constructor(base: BaseViewModel.BaseDeps, deps: SubmissionViewModel.Deps) {
        super(base)
        this._deps = deps
    }

    selectStyle(style: string) {
        this._deps.stream.send({ event: 'submit', style })
        this._deps.state.playerState!.submission = { style }
    }

}

export namespace SubmissionViewModel {
    export const Deps = Inject.from({
        state: GameData.State,
        stream: GameData.Stream,
    })

    export type Deps = Target<typeof Deps>
    export class Factory extends ViewModelFactoryKey(SubmissionViewModel, Deps) { private _: any }
}
