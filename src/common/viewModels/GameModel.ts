import { BehaviorSubject, Subscription, combineLatest, distinctUntilChanged, map, noop, zip } from 'rxjs';
import { GameState, PlayerState } from '../../proto/GameState';
import { EventStream } from '../ApiClient';
import { Reactive } from '../utils/Reactive';
import { BaseViewModel, ViewModel } from './ViewModel';
import { LobbyViewModel } from './LobbyViewModel';

export class GameModel extends BaseViewModel {
    readonly props: Reactive<{
        gameState?: GameState
        playerState?: PlayerState
    }> = Reactive({})

    readonly childViewModel = new BehaviorSubject<ViewModel | null>(null)

    private readonly _stream: EventStream;

    constructor(deps: BaseViewModel.Deps, stream: EventStream) {
        super(deps)
        this._stream = stream
    }


    protected override onAttach(sub: Subscription): void {
        Reactive.prop(this.props, 'gameState.round').value
        sub.add(this._updateViewModel())
        sub.add(this._loop())
    }

    private _updateViewModel() {
        const getLobby = () => this.initViewModel(LobbyViewModel, { state: this.props })

        return Reactive.props(this.props, [
            'gameState.started',
            'gameState.round',
            'gameState.round.judgmentEndTime',
        ] as const, (started, round, judgmentEndTime) => {
            if (!started) return getLobby

            return null
        }).subscribe(f => f == null ? null : this.childViewModel.next(f()))
    }

    private _loop() {
        const props = this.props
        return this._stream.recv().subscribe(e => {
            try {
                switch (e.event) {
                    case 'reloadState': {
                        props.gameState = e.gameState
                        props.playerState = e.playerState
                    } break
                    case 'addPlayer': {
                        const { player } = e
                        props.gameState!.playerList = [...props.gameState!.playerList, player]
                    } break
                    case 'beginGame': {
                        props.gameState!.started = true
                    } break
                    case 'beginRound': {
                        const { prompt, round, styleSuggestions, submissionEndTime, voteCount } = e
                        props.gameState!.round = {
                            number: round,
                            prompt,
                            submissions: {},
                            submissionEndTime,
                            voteCount,
                        }
                        props.playerState!.styleSuggestions = styleSuggestions
                    } break
                    case 'generateSubmission': {
                        const { id, output } = e
                        props.playerState!.submission!.id = id
                        props.playerState!.submission!.output = output
                    } break
                    case 'endSubmissions': {
                        // TODO: what do?
                    } break
                    case 'beginJudgment': {
                        const { judgmentEndTime, round: _, submissions } = e
                        props.gameState!.round!.judgmentEndTime = judgmentEndTime
                        props.gameState!.round!.submissions = submissions
                    } break
                    case 'endRound': {
                        const { round: _round, scores, submissionIds } = e
                        props.gameState!.round!.submissionIds = submissionIds

                        for (let userId in scores) {
                            props.gameState!.scores[userId] ??= []
                            props.gameState!.scores[userId]?.push(scores[userId] ?? 0)
                        }
                    } break
                    case 'endGame': {
                        props.gameState!.round = undefined
                    } break
                    default: {
                        // assert that all cases are handled:
                        let _e: never = e
                        return _e
                    }
                }
            } catch (ex) {
                console.error(ex)
            }
        })
    }
}
