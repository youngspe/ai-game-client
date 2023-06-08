
export interface GameState {
    playerList: { userId: string; displayName: string; }[]
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
        judgmentEndTime?: number
        voteCount: number
    }
}

export interface PlayerState {
    displayName: string
    styleSuggestions?: string[]
    submission?: {
        id?: string
        style: string
        output?: string
    }
    votes?: { [SubmissionId in string]?: number }
}
