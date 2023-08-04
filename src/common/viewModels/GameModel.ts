import { BehaviorSubject, Subscription } from 'rxjs';
import { Reactive } from '../utils/Reactive';
import { BaseViewModel, ViewModel } from './ViewModel';
import { LobbyViewModel } from './LobbyViewModel';
import { SubmissionViewModel } from './SubmissionViewModel';
import { VotingViewModel } from './VotingViewModel';
import { RoundScoreViewModel } from './RoundScoreViewModel';
import { Inject, LazyKey, Target } from 'checked-inject';
import { GameData, GameScope } from '../GameData';
import { GameStateManager } from '../GameStateManager';

export class GameModel extends BaseViewModel {
    readonly childViewModel = new BehaviorSubject<ViewModel | null>(null)

    private readonly _deps: GameModel.Deps
    get state() { return this._deps.stateManager.props }

    constructor(base: BaseViewModel.BaseDeps, deps: GameModel.Deps) {
        super(base)
        this._deps = deps
    }

    protected override onAttach(sub: Subscription): void {
        sub.add(this._updateViewModel())
        sub.add(this._deps.stateManager.resume())
    }

    private _updateViewModel() {
        const vm = this._deps.vm

        return Reactive.props(this._deps.stateManager.props, [
            'gameState.started',
            'gameState.round',
            'gameState.round.judgmentEndTime',
            'gameState.round.scoreEndTime',
        ] as const, (started, round, judgmentEndTime, scoreEndTime) => {
            if (!started) return vm.lobby
            if (round == null) return null // TODO: endgame
            if (judgmentEndTime == null) return vm.submission
            if (scoreEndTime == null) return vm.voting
            // TODO: Round results screen

            return null
        }).subscribe(f => this.childViewModel.next(f == null ? null : f()))
    }

    static scope = () => GameScope
    static inject = () => Inject.construct(this, BaseViewModel.BaseDeps, this.Deps)
}

export namespace GameModel {
    export const Deps = LazyKey(() => ({
        stream: GameData.Stream,
        vm: {
            lobby: LobbyViewModel.Factory,
            submission: SubmissionViewModel.Factory,
            voting: VotingViewModel.Factory,
            score: RoundScoreViewModel.Factory
        },
        stateManager: GameStateManager,
    }))

    export type Deps = Target<typeof Deps>
}
