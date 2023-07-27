export abstract class TokenStore {
    abstract load(): string | null
    abstract store(token: string): void
}
