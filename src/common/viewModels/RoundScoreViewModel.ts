import { Subscription } from "rxjs"
import { Reactive } from "../utils/Reactive"
import { BaseViewModel } from "./ViewModel"
import { EventStream } from "../ApiClient"
import { ascribe } from "../utils/types"
import { LazyKey, Target } from "checked-inject"
import { ViewModelFactoryKey } from "../utils/ViewModelFactoryKey"
import { GameData } from "../GameData"

export class RoundScoreViewModel extends BaseViewModel {
    private readonly _deps: RoundScoreViewModel.Args
    readonly props = Reactive({
        scores: ascribe<{ displayName: string, currentScore: number, totalScore: number }[]>([]),
    })
    readonly roundNumber: number

    constructor(base: BaseViewModel.BaseDeps, deps: RoundScoreViewModel.Deps) {
        super(base)
        this._deps = deps
        this.roundNumber = this._deps.state.gameState!.round!.number
    }

    protected override onAttach(sub: Subscription): void {
        sub.add(Reactive.props(this._deps.state, [
            'gameState.scores',
            'playerState.',
        ] as const, (submissions, id) => (submissions && Object.getOwnPropertyNames(submissions).filter(s => s !== id)) ?? []
        ).pipe().subscribe(ids => { }))
    }
}

export namespace RoundScoreViewModel {
    export const Deps = LazyKey(() => ({
        state: GameData.State,
        stream: GameData.Stream,
    }))

    export type Deps = Target<typeof Deps>
    export interface Args {
        state: GameData.State,
        stream: EventStream,
    }

    export const Factory = class extends ViewModelFactoryKey(RoundScoreViewModel, Deps) { private _: any }
}
