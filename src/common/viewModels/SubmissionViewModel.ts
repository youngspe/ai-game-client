import { Subscription } from "rxjs";
import { GameState, PlayerState } from "../../proto/GameState";
import { Reactive } from "../utils/Reactive";
import { BaseViewModel } from "./ViewModel";
import { EventStream } from "../ApiClient";

export class SubmissionViewModel extends BaseViewModel {
    readonly args: SubmissionViewModel.Args;

    constructor(deps: BaseViewModel.Deps, args: SubmissionViewModel.Args) {
        super(deps)
        this.args = args
    }

    selectStyle(style: string) {
        this.args.stream.send({ event: 'submit', style })
    }
}

export namespace SubmissionViewModel {
    export interface Args {
        state: Reactive<{ gameState?: GameState, playerState?: PlayerState }>
        stream: EventStream,
    }
}
