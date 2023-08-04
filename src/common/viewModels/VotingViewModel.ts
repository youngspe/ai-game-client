import { Subscription } from "rxjs";
import { Reactive } from "../utils/Reactive";
import { BaseViewModel } from "./ViewModel";
import { ascribe } from "../utils/types";
import { shuffle } from "../utils/rand";
import { ViewModelFactoryKey } from "../utils/ViewModelFactoryKey";
import { GameData } from "../GameData";
import { LazyKey, Target } from "checked-inject";

export class VotingViewModel extends BaseViewModel {
    private readonly _deps: VotingViewModel.Deps
    get state() { return this._deps.state }
    readonly props: Reactive<{
        votesRemaining: number
        submissionOrder: string[]
    }>

    constructor(base: BaseViewModel.BaseDeps, deps: VotingViewModel.Deps) {
        super(base)
        this._deps = deps
        this.props = Reactive({
            votesRemaining: deps.state.gameState?.round?.voteCount ?? 0,
            submissionOrder: ascribe<string[]>([]),
        })
    }

    protected onAttach(sub: Subscription): void {
        sub.add(Reactive.props(this._deps.state, [
            'gameState.round.submissions',
            'playerState.submission.id',
        ] as const, (submissions, id) => (submissions && Object.getOwnPropertyNames(submissions).filter(s => s !== id)) ?? []
        ).subscribe(ids => {
            shuffle(ids)
            this.props.submissionOrder = ids
        }))
    }

    vote(submissionId: string, positive: boolean) {
        const votes = this._deps.state.playerState!.votes ?? {}
        this._deps.state.playerState!.votes = votes
        votes[submissionId] ??= 0

        if (positive && this.props.votesRemaining > 0) {
            votes[submissionId]! += 1
            this.props.votesRemaining -= 1
        } else if (!positive && votes[submissionId] != 0) {
            votes[submissionId]! -= 1
            this.props.votesRemaining += 1
        } else {
            return
        }

        this._deps.stream.send({ event: 'vote', votes })
    }

}

export namespace VotingViewModel {
    export const Deps = LazyKey(() => ({
        state: GameData.State,
        stream: GameData.Stream
    }))

    export type Deps = Target<typeof Deps>

    export const Factory = class extends ViewModelFactoryKey(VotingViewModel, Deps) { private _: any }
}
