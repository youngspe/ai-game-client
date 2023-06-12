import { Subscription } from "rxjs";
import { GameState, PlayerState } from "../../proto/GameState";
import { Reactive } from "../utils/Reactive";
import { BaseViewModel } from "./ViewModel";
import { EventStream } from "../ApiClient";
import { ascribe } from "../utils/types";
import { shuffle } from "../utils/rand";

export class VotingViewModel extends BaseViewModel {
    readonly args: VotingViewModel.Args
    readonly props: Reactive<{
        votesRemaining: number
        submissionOrder: string[]
    }>

    constructor(deps: BaseViewModel.Deps, args: VotingViewModel.Args) {
        super(deps)
        this.args = args
        this.props = Reactive({
            votesRemaining: args.state.gameState?.round?.voteCount ?? 0,
            submissionOrder: ascribe<string[]>([]),
        })
    }

    protected onAttach(sub: Subscription): void {
        sub.add(Reactive.props(this.args.state, [
            'gameState.round.submissions',
            'playerState.submission.id',
        ] as const, (submissions, id) => (submissions && Object.getOwnPropertyNames(submissions).filter(s => s !== id)) ?? []
        ).subscribe(ids => {
            shuffle(ids)
            this.props.submissionOrder = ids
        }))
    }

    vote(submissionId: string, positive: boolean) {
        const votes = this.args.state.playerState!.votes ?? {}
        this.args.state.playerState!.votes = votes
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

        this.args.stream.send({ event: 'vote', votes })
    }
}

export namespace VotingViewModel {
    export interface Args {
        state: Reactive<{ gameState?: GameState, playerState?: PlayerState }>,
        stream: EventStream,
    }
}
