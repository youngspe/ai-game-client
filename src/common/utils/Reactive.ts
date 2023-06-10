import { NEVER, Observable, Subject, Subscription, distinctUntilChanged, filter, of, switchMap } from "rxjs"
import { StateObservable } from "./rxUtils"
import { addProp } from "./types"
import { useEffect, useRef, useState } from "react"

const _reactive = Symbol()

interface ReactiveContext<T> {
    obs: Observable<Reactive.PropertyChange<T>>
    orig: T
}

interface ReactiveObject<T> {
    [_reactive]: ReactiveContext<T>
}

export type Reactive<T> = T & (
    T extends object ? ReactiveObject<T> : unknown
)

const reactiveMap = new WeakMap<object, object>()

export function Reactive<T>(target: T): Reactive<T> {
    if (target == null || typeof target != 'object') return target as Reactive<T>
    if (Reactive.isReactive(target)) return target as Reactive<T>
    if (reactiveMap.has(target)) return reactiveMap.get(target) as Reactive<T>
    const subject = new Subject<Reactive.PropertyChange<T>>()

    const reactiveContext: ReactiveContext<T> = {
        obs: subject.asObservable(),
        orig: target,
    }

    const proxy = new Proxy(target, {
        get(target, p, receiver) {
            if (p === _reactive) return reactiveContext
            return Reactive(Reflect.get(target, p, receiver))
        },
        set(target, p, newVal, receiver) {
            let prop = p as keyof T
            const oldVal = target[prop]
            const out = Reflect.set(target, prop, newVal, receiver)
            if (oldVal !== newVal) {
                subject.next({ prop, oldVal, newVal })
            }
            return out
        },
    }) as Reactive<T> & object

    reactiveMap.set(target, proxy)

    return proxy
}

type UnionProp<T, K> = T extends any ? (K extends keyof T ? T[K] : undefined) : never

type PropPathValue<T, P extends (keyof any)[] | string> =
    P extends [] ? T
    : P extends `${infer K}.${infer R}` ? PropPathValue<UnionProp<T, K>, R>
    : P extends string ? UnionProp<T, P>
    : P extends [infer K] ? UnionProp<T, K>
    : P extends [infer K extends keyof T, ...infer R extends (keyof any)[]] ? PropPathValue<UnionProp<T, K>, R>
    : never

export namespace Reactive {
    export type PropertyChange<T, P extends keyof T = keyof T> = {
        [K in P]-?: { prop: K, oldVal: T[K], newVal: T[K] }
    }[P]

    export function isReactive<T>(target: T): target is Reactive<T> {
        if (target == null || typeof target != 'object') return true
        return (target as Partial<ReactiveObject<T>>)[_reactive] != null
    }

    export function updates<T>(target: Reactive<T>): Observable<PropertyChange<T>> {
        if (target == null || typeof target != 'object') return NEVER
        return (target as Reactive<T & object>)[_reactive].obs
    }

    export function original<T>(target: Reactive<T>): T {
        if (target == null || typeof target != 'object') return target
        return (target as Reactive<typeof target>)[_reactive].orig as T
    }

    export function prop<T, P extends (keyof any)[]>(
        target: Reactive<T>, ...keys: P
    ): StateObservable<Reactive<PropPathValue<T, P extends [infer S extends string] ? S : P>>> {
        if (keys.length == 0) {
            const out = of(target)
            addProp(out, 'value', { value: target })
            return out as any
        }
        let path: (keyof any)[] = (keys.length == 1 && typeof keys[0] == 'string') ? keys[0].split('.') : keys

        function inner1<T1, K extends keyof T1>(target: Reactive<T1>, key: K): StateObservable<Reactive<T1[K]>> {
            return new class extends Observable<Reactive<any>> {
                get value() { return target?.[key] as Reactive<T1[K]> }

                constructor() {
                    super(s => {
                        s.next(target[key])
                        return updates(target).pipe(filter(e => e.prop == key)).subscribe(() => {
                            s.next(this.value)
                        })
                    })
                }
            }()
        }

        function inner2<T1, P1 extends (keyof any)[]>(target: Reactive<T1>, [key, ...rest]: P1): StateObservable<Reactive<any>> {
            const child = inner1(target, key as keyof T1)
            if (rest.length == 0) return child

            const out = child.pipe(switchMap((x: Reactive<any>) => inner2(x, rest)), distinctUntilChanged())
            addProp(out, 'value', { get: () => rest.reduce((prev: any, prop) => prev?.[prop], child.value) as Reactive<any> })
            return out
        }

        return inner2(target, path)
    }
}

export function useReactive<T>(target: Reactive<T>): T {
    const [_state, setState] = useState(false)
    type Entry = { [_ in string | symbol]?: { subbed: boolean, entry: Entry } }
    const subbed = useRef<Entry>({}).current
    const proxies = useRef(new WeakMap<any, any>()).current
    const sub = useRef<Subscription | null>(new Subscription())

    const onUpdate = () => setState(!_state)

    function getProxy<U>(obj: U, path: (keyof any)[], entry: Entry): U {
        if (obj == null || typeof obj != 'object') return obj
        if (proxies.has(obj)) return proxies.get(obj)

        const proxy = new Proxy(obj, {
            get(t, p, receiver) {
                const propPath = [...path, p]
                const propEntry = entry[p] ?? { subbed: false, entry: {} }
                entry[p] = propEntry

                const propValue = Reflect.get(t, p, receiver)

                if (!propEntry.subbed && propValue == null || typeof propValue != 'object') {
                    propEntry.subbed = true
                    let first: [unknown] | null = [propValue]
                    sub.current?.add(Reactive.prop(target, ...propPath).subscribe(x => {
                        if (first != null && x !== first[0]) {
                            first = null
                            onUpdate()
                        }
                    }))
                }

                return getProxy(propValue, propPath, propEntry.entry)
            },
        })
        proxies.set(obj, proxy)
        return proxy
    }

    useEffect(() => {
        sub.current ??= new Subscription()
        return () => {
            sub.current?.unsubscribe()
        }
    }, [target])

    return getProxy(target, [], subbed)
}
