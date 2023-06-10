export type OneProp<T> = {
    [K in keyof T]: { [_ in K]: T[K] }
}[keyof T]

export function ascribe<T>(value: T): T {
    return value
}

type IsSingleType<S> = _IsSingleType1<S>
type _IsSingleType1<S1, S2 = S1> = S1 extends infer J ? _IsSingleType2<J, S2> : never
type _IsSingleType2<J, K> = Exclude<K, J> extends never ? true : false

type Extends<Sub, Super> = Sub extends Super ? true : false
type IsLiteral<T> = Extends<string | number | object | boolean | symbol, T> & true extends never ? true : false

type IfTrue<T> = T & false extends never ? void : never

type And<X> =
    X extends true ? true
    : X extends [] ? true
    : X extends [true, ...infer Y] ? And<Y>
    : false

type IsSingleLiteral<T> = And<[IsSingleType<T>, IsLiteral<T>]>

{
    const _test1: IsSingleType<1> = true
    const _test2: IsSingleType<1 | 2> = false
    const _test3: IsSingleType<string> = true
    const _test4: IsSingleType<string | number> = false
}

{
    const _test1: IsLiteral<'foo'> = true
    const _test2: IsLiteral<string> = false
}

{
    const _test1: IsSingleLiteral<1> = true
    const _test2: IsSingleLiteral<1 | 2> = false
    const _test3: IsSingleLiteral<string> = false
}
// type T2 = SingleType<1 | 2>

// type Asdf =
//     | ('asdf' extends infer K ? (('asdf' | 'qwer') extends K ? K : never) : never)
//     | ('qwer' extends infer K ? (('asdf' | 'qwer') extends K ? K : never) : never)

type Allowed<T, K> =
    K extends keyof T ? [never]
    : IsSingleLiteral<K> extends true ? []
    : [never]

export function addProp<
    T extends object,
    K extends keyof any,
    P extends { readonly value: unknown } | { readonly get: () => any, readonly set?: (value: any) => void }
>(target: T, key: K, value: P, ..._: Allowed<T, K>): asserts target is T & (
    P extends { readonly value: infer V } | { readonly get: () => infer V, set: (value: infer V) => void } ? { [_ in K]: V }
    : P extends { readonly get: () => infer V } ? { readonly [_ in K]: V }
    : never
) {
    if ('get' in value) {
        Object.defineProperty(target, key, value)
    } else {
        (target as any)[key] = value.value
    }
}
