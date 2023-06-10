import { NEVER, Observable, Subject, Subscription, combineLatest, distinctUntilChanged, filter, of, skip, switchMap } from "rxjs"
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
    T extends object ? (object & ReactiveObject<T>) : unknown
)

const reactiveMap = new WeakMap<object, object>()

function thisOrOrig<T>(target: T): T {
    if (target == null || typeof target != 'object') return target
    return (target as Partial<ReactiveObject<T>>)[_reactive]?.orig ?? target
}

export function Reactive<T>(target: T): Reactive<T> {
    if (target == null || typeof target != 'object') return target as Reactive<T>

    const originalTarget = (target as Partial<ReactiveObject<T>>)[_reactive]?.orig
    if (originalTarget != null && reactiveMap.has(originalTarget as object)) {
        return reactiveMap.get(originalTarget as object) as Reactive<T>
    }

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
            if (thisOrOrig(oldVal) !== thisOrOrig(newVal)) {
                const out = Reflect.set(target, prop, newVal, receiver)
                subject.next({ prop, oldVal, newVal })
                return out
            }
            return Reflect.set(target, prop, oldVal, receiver)
        },
    }) as Reactive<T> & object

    reactiveMap.set(target, proxy)
    return proxy
}

type UnionKeys<T> = T extends any ? keyof T : never
type UnionProp<T, K> = T extends any ? (K extends keyof T ? T[K] : undefined) : never

type PropPathValue<T, P extends readonly (keyof any)[] | string> =
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

    export function isReactiveObject<T>(target: T): target is object & Reactive<T> {
        if (target == null || typeof target != 'object') return false
        return (target as Reactive<typeof target>)[_reactive] != null
    }

    export function updates<T>(target: Reactive<T>): Observable<PropertyChange<T>> {
        if (target == null || typeof target != 'object') return NEVER
        return (target as Reactive<T & object>)[_reactive].obs
    }

    export function original<T>(target: Reactive<T>): T {
        if (target == null || typeof target != 'object') return target
        return (target as Reactive<typeof target>)[_reactive].orig as T
    }

    export function prop<T, P extends readonly (keyof any)[]>(
        target: Reactive<T>, ...keys: P
    ): StateObservable<Reactive<PropPathValue<T, P extends [infer S extends string] ? S : P>>> {
        if (keys.length == 0) {
            const out = of(target)
            addProp(out, 'value', { value: target })
            return out as any
        }
        let path: readonly (keyof any)[] = (keys.length == 1 && typeof keys[0] == 'string') ? keys[0].split('.') : keys

        function inner1<T1, K extends keyof T1>(target: Reactive<T1>, key: K): StateObservable<Reactive<T1[K]>> {
            return new class extends Observable<Reactive<any>> {
                get value() { return target?.[key] as Reactive<T1[K]> }

                constructor() {
                    super(s => {
                        s.next(target?.[key])
                        return updates(target).pipe(filter(e => e.prop == key)).subscribe(() => {
                            s.next(this.value)
                        })
                    })
                }
            }()
        }

        function inner2<T1, P1 extends readonly (keyof any)[]>(target: Reactive<T1>, [key, ...rest]: P1): StateObservable<Reactive<any>> {
            const child = inner1(target, key as keyof T1)
            if (rest.length == 0) return child

            const out = child.pipe(switchMap((x: Reactive<any>) => inner2(x, rest)), distinctUntilChanged())
            addProp(out, 'value', { get: () => rest.reduce((prev: any, prop) => prev?.[prop], child.value) as Reactive<any> })
            return out
        }

        return inner2(target, path)
    }

    type PropPathValues<T, P extends readonly (readonly (keyof any)[] | string)[]> = {
        [K in keyof P]: PropPathValue<T, P[K]>
    }

    export function props<T, U, A extends readonly (readonly (keyof any)[] | string)[]>(
        target: Reactive<T>,
        keyPaths: A,
        combine: (...args: PropPathValues<T, A>) => U,
    ): StateObservable<U> {
        let observables: StateObservable<any>[] = keyPaths.map(p => Reactive.prop(target, ...((typeof p == 'string') ? [p] : p)))
        const obs = combineLatest(observables, combine as (...args: any[]) => U).pipe(distinctUntilChanged())
        addProp(obs, 'value', { get: () => combine(...observables.map(o => o.value) as any) })
        return obs
    }
}

const _useReactive = Symbol()

export function useReactive<T>(target: T): T extends object ? T : { [_ in string]?: undefined } {
    if (target == null) return {} as any
    const rTarget = Reactive(target)
    const [_state, setState] = useState({})
    type Entry = { [_ in string | symbol]?: Entry }
    const subbed = useRef<Entry>({}).current
    const proxies = useRef<WeakMap<any, any> | null>(new WeakMap())

    const onUpdate = () => setState({})

    useEffect(() => {
        const sub = new Subscription()
        proxies.current = null

        function subscribeProps(subbed: Entry, path: (keyof any)[]) {
            for (let prop in subbed) {
                const newPath = [...path, prop]
                sub.add(Reactive.prop(rTarget, ...newPath).pipe(skip(1)).subscribe(onUpdate))
                subscribeProps(subbed[prop]!, newPath)
            }
        }

        subscribeProps(subbed, [])
        return () => {
            sub.unsubscribe()
        }
    }, [rTarget])


    if (proxies.current == null) {
        return Reactive.original(rTarget) as any
    }

    function getProxy<U>(obj: U, entry: Entry): U {
        if (obj == null || typeof obj != 'object') return obj
        if ((obj as any)[_useReactive] != null) obj = (obj as any)[_useReactive]
        obj = Reactive.isReactiveObject(obj) ? Reactive(obj) : obj
        if (proxies.current?.has(obj)) return proxies.current.get(obj)


        const proxy = new Proxy(obj as U & object, {
            get(t, p, receiver) {
                if (p === _useReactive) return obj
                const propValue = Reflect.get(t, p, receiver)
                if (proxies.current == null) return propValue
                const propEntry = entry[p] ?? {}
                entry[p] = propEntry
                return getProxy<any>(propValue, propEntry)
            },
        })
        proxies.current?.set(obj, proxy)
        return proxy
    }

    return getProxy(Reactive.original(rTarget), subbed) as any
}
