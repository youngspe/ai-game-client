
export interface PlayerInfo { userId: string; displayName: string; }

export interface GameState {
    gameId: string
    playerList: PlayerInfo[]
    ownerId: string;
    started: boolean,

    scores: {
        [UserId in string]?: number[]
    }

    round?: {
        number: number
        prompt: string
        submissions: { [SubmissionId in string]?: { style: string, output: string } }
        submissionEndTime?: number
        submissionIds?: { [UserId in string]?: string },
        judgmentEndTime?: number
        scoreEndTime?: number
        voteCount: number
    }
}

export interface PlayerState {
    userId: string
    displayName: string
    styleSuggestions?: string[]
    submission?: {
        id?: string
        style: string
        output?: string
    }
    votes?: { [SubmissionId in string]?: number }
}
