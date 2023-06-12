export function randInt(min: number, max: number) {
    return (Math.random() * (max - min) + min) | 0
}

export function shuffle<T>(arr: T[]) {
    for (let i = 0; i < arr.length; ++i) {
        const j = randInt(i, arr.length)
        { [arr[i], arr[j]] = [arr[j], arr[i]] }
    }
}
