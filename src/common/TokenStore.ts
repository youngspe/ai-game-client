export interface TokenStore {
    load(): string | null;
    store(token: string): void;
}
