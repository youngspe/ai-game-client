import { Inject } from "checked-inject"
import { GameData, GameScope } from "./GameData"
import { EventStream } from "./ApiClient"
import { Reactive } from "./utils/Reactive"
import { GameState, PlayerState } from "../proto/GameState"

export class GameStateManager {
    readonly props: Reactive<{
        gameState?: GameState
        playerState?: PlayerState
    }> = Reactive({})

    private _stream: EventStream

    constructor(stream: EventStream) {
        this._stream = stream
    }

    resume() {
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
                        const { round: _round, scores, submissionIds, scoreEndTime } = e
                        props.gameState!.round!.submissionIds = submissionIds
                        props.gameState!.round!.scoreEndTime = scoreEndTime

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

    close() { this._stream.close() }

    static inject = Inject.construct(this, GameData.Stream)
    static scope = GameScope
}
