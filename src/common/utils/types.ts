export type OneProp<T> = {
    [K in keyof T]: { [_ in K]: T[K] }
}[keyof T]

export function ascribe<T>(value: T): T {
    return value
}
