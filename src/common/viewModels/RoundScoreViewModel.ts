import { Subscription } from "rxjs";
import { GameState, PlayerState } from "../../proto/GameState";
import { Reactive } from "../utils/Reactive";
import { BaseViewModel } from "./ViewModel";
import { EventStream } from "../ApiClient";
import { ascribe } from "../utils/types";
import { shuffle } from "../utils/rand";

export class RoundScoreViewModel extends BaseViewModel {
    readonly args: RoundScore.Args
    readonly props = Reactive({
        scores: ascribe<{ displayName: string, currentScore: number, totalScore: number }[]>([]),
    })
    readonly roundNumber: number

    constructor(deps: BaseViewModel.Deps, args: RoundScore.Args) {
        super(deps)
        this.args = args
        this.roundNumber = this.args.state.gameState!.round!.number
    }

    protected override onAttach(sub: Subscription): void {
        sub.add(Reactive.props(this.args.state, [
            'gameState.scores',
            'playerState.',
        ] as const, (submissions, id) => (submissions && Object.getOwnPropertyNames(submissions).filter(s => s !== id)) ?? []
        ).pipe().subscribe(ids => { }))
    }
}

export namespace RoundScore {
    export interface Args {
        state: Reactive<{ gameState?: GameState, playerState?: PlayerState }>,
        stream: EventStream,
    }
}
