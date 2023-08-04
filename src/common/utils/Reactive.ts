import { NEVER, Observable, Subject, Subscription, combineLatest, distinctUntilChanged, filter, of, skip, switchMap } from "rxjs"
import { StateObservable, useStateObservable } from "./rxUtils"
import { addProp } from "./types"
import { useEffect, useRef, useState } from "react"

const _proxied = Symbol()
const _reactive = Symbol()

interface ProxiedContext<T> {
    orig: T & object
}

interface ProxiedObject<T> {
    [_proxied]: ProxiedContext<T>
}

interface ReactiveContext<T> {
    obs: Observable<Reactive.PropertyChange<T>>
    proxy: Reactive<T>
}

interface ReactiveObject<T> {
    [_reactive]: ReactiveContext<T>
}

export type Reactive<T> = T & (
    T extends object ? (ReactiveObject<T> & ProxiedObject<T>) : unknown
)

export function Reactive<T>(target: T): Reactive<T> {
    if (target == null || (typeof target != 'object' && typeof target != 'function')) return target as Reactive<T>
    const marked: Partial<ReactiveObject<T>> = target
    if (marked[_reactive]) return marked[_reactive].proxy
    const proxiedContext = (target as Partial<ProxiedObject<T>>)[_proxied]
        ?? ((target as Partial<ProxiedObject<T>>)[_proxied] = { orig: target })


    const subject = new Subject<Reactive.PropertyChange<T>>()
    const reactiveContext: Partial<ReactiveContext<T>> = { obs: subject.asObservable() }
    marked[_reactive] = reactiveContext as ReactiveContext<T>

    const proxy = new Proxy(proxiedContext.orig, {
        get(target, p, receiver) {
            const value = Reflect.get(target, p, receiver)
            if (p === _proxied) return value ?? proxiedContext
            if (typeof p == 'string') return Reactive(value)
            return value
        },
        set(target, p, newVal, receiver) {
            let prop = p as keyof T
            const oldVal = target[prop]
            if (typeof p == 'string' && _original(oldVal) !== _original(newVal)) {
                const out = Reflect.set(target, prop, newVal, receiver)
                subject.next({ prop, oldVal, newVal })
                return out
            }
            return Reflect.set(target, prop, oldVal, receiver)
        },
        apply(target, thisArg, args) {
            return Reflect.apply(target as any as Function, _original(thisArg), args)
        },
    }) as Reactive<T> & object

    reactiveContext.proxy = proxy
    return proxy
}

type UnionKeys<T> = T extends any ? keyof T : never
type UnionProp<T, K> = T extends any ? (K extends keyof T ? T[K] : undefined) : never

type BasePropPath = keyof any | readonly BasePropPath[]

type PropPathValue<T, P extends BasePropPath> =
    P extends `${infer K}.${infer R}` ? PropPathValue<UnionProp<T, K>, R> :
    P extends keyof any ? UnionProp<T, P> :
    P extends readonly [] ? T :
    P extends readonly [infer K extends BasePropPath, ...infer R extends (keyof any)[]] ? PropPathValue<PropPathValue<T, K>, R> :
    never

function flattenPropPath<P extends BasePropPath>(path: P): (keyof any)[] {
    if (path instanceof Array) return path.flatMap(flattenPropPath)
    if (typeof path == 'string') return path.split('.')
    return [path]
}

function _original<T>(target: T | ProxiedObject<T>): T {
    if (typeof target == null || (typeof target != 'object' && typeof target != 'function')) return target as T
    const orig = (target as Partial<ProxiedObject<T>>)[_proxied]?.orig
    if (orig && orig !== target) return _original(orig)
    return target as T
}

export namespace Reactive {
    export type PropertyChange<T, P extends keyof T = keyof T> = {
        [K in P]-?: { prop: K, oldVal: T[K], newVal: T[K] }
    }[P]

    export function isReactiveObject<T>(target: T): target is object & Reactive<T> {
        if (target == null || (typeof target != 'object' && typeof target != 'function')) return false
        const _target: Partial<Reactive<typeof target>> = target
        return _target[_reactive] != null && _target[_proxied] != null
    }

    export function updates<T>(target: Reactive<T>): Observable<PropertyChange<T>> {
        if (target == null || (typeof target != 'object' && typeof target != 'function')) return NEVER
        return (target as Reactive<T & object>)[_reactive].obs
    }

    export function original<T>(target: Reactive<T>): T {
        return _original<T>(target)
    }

    export function prop<T, P extends readonly BasePropPath[]>(
        target: Reactive<T>, ...keys: P
    ): StateObservable<Reactive<PropPathValue<T, P extends [infer S extends string] ? S : P>>> {
        const path = flattenPropPath(keys)
        if (keys.length == 0) {
            const out = of(target)
            addProp(out, 'value', { value: target })
            return out as any
        }

        function inner1<T1, K extends keyof T1>(target: Reactive<T1>, key: K): StateObservable<Reactive<T1[K]>> {
            return new class extends Observable<Reactive<any>> {
                get value() { return target?.[key] as Reactive<T1[K]> }

                constructor() {
                    super(s => {
                        s.next(target?.[key])
                        const updateObservable = updates(target)

                        return updateObservable.pipe(filter(e => e.prop == key)).subscribe(() => {
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

    type PropPathValues<T, P extends readonly BasePropPath[]> = {
        [K in keyof P]: PropPathValue<T, P[K]>
    }

    export function props<T, U, A extends readonly BasePropPath[]>(
        target: Reactive<T>,
        keyPaths: A,
        combine: (...args: PropPathValues<T, A>) => U,
    ): StateObservable<U> {
        let observables: StateObservable<any>[] = keyPaths.map(p => Reactive.prop(target, p))
        const obs = combineLatest(observables, combine as (...args: any[]) => U).pipe(distinctUntilChanged())
        addProp(obs, 'value', { get: () => combine(...observables.map(o => o.value) as any) })
        return obs
    }
}

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
        return _original(rTarget) as any
    }

    function getProxy<U>(obj: U, entry: Entry): U {
        if (obj == null || (typeof obj != 'object' && typeof obj != 'function')) return obj
        obj = _original(obj)
        if (proxies.current?.has(obj)) return proxies.current.get(obj)

        const proxiedContext = (obj as Partial<ProxiedObject<U>>)[_proxied] ?? { orig: obj }

        const proxy = new Proxy(obj as U & object, {
            get(t, p, receiver) {
                if (p === _proxied) return proxiedContext
                const propValue = Reflect.get(t, p, receiver)
                if (proxies.current == null) return propValue
                const propEntry = entry[p] ?? {}
                entry[p] = propEntry
                return getProxy<any>(propValue, propEntry)
            },
            apply(target, thisArg, args) {
                return Reflect.apply(target as any as Function, _original(thisArg), args)
            },
        })
        proxies.current?.set(obj, proxy)
        return proxy
    }

    return getProxy(rTarget, subbed) as any
}

export function useReactiveProp<T, P extends readonly BasePropPath[]>(
    target: Reactive<T>, ...keys: P
): Reactive<PropPathValue<T, P extends [infer S extends string] ? S : P>> {
    return useStateObservable(Reactive.prop(target, flattenPropPath(keys)))
}
