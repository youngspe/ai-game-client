import { GameState, PlayerState } from "./GameState"

export type Event<Name extends string = string, Values = unknown> = {
    event: Name,
} & Values

export type ServerEvent = Event & (
    | { event: 'reloadState', gameState: GameState, playerState: PlayerState }
    | { event: 'addPlayer', player: { userId: string, displayName: string } }
    | { event: 'beginGame', }
    | { event: 'beginRound', round: number, prompt: string, styleSuggestions: string[], submissionEndTime: number, voteCount: number }
    | { event: 'endSubmissions' }
    | { event: 'generateSubmission', output: string, id: string }
    | {
        event: 'beginJudgment'
        round: number
        submissions: { [SubmissionId in string]?: { style: string, output: string } }
        judgmentEndTime: number
    }
    | {
        event: 'endRound',
        round: number,
        submissionIds: { [UserId in string]?: string },
        scores: { [UserId in string]?: number },
    }
    | { event: 'endGame' }
)

export type ClientEvent = Event & (
    | { event: 'start' }
    | { event: 'submit', style: string }
    | { event: 'vote', votes: { [SubmissionId in string]?: number } }
)
