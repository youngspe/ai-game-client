import { GameState, PlayerState } from '../../proto/GameState';
import { EventStream } from '../ApiClient';
import { Reactive2 } from '../utils/Reactive2';

export class GameModel {
    readonly props: Reactive2<{
        gameState?: GameState
        playerState?: PlayerState
    }> = Reactive2({})

    private readonly _stream: EventStream;

    constructor(stream: EventStream) {
        this._stream = stream
    }

    async loop(): Promise<void> {
        const props = this.props
        for await (let e of this._stream.recv()) {
            try {
                switch (e.event) {
                    case 'reloadState': {
                        props.gameState = e.gameState
                        props.playerState = e.playerState
                    } break
                    case 'addPlayer': {
                        const { player } = e
                        props.gameState!.playerList.push(player)
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
        }
    }
}
