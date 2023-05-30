import { Observable, Subject, BehaviorSubject, mergeMap, NEVER, of, Subscription } from 'rxjs'
import { useRef, useEffect, useState } from 'react'
import { OneProp } from './types'
import { StateObservable } from './rxUtils'

const _updates: unique symbol = Symbol()
const _props: unique symbol = Symbol()
const _inner: unique symbol = Symbol()

export type Reactive<T = any> = object & { [K in keyof T]: T[K] } & {
    readonly [_updates]: Observable<OneProp<T>>,
    readonly [_props]: { [K in keyof T]: StateObservable<T[K]> },
    readonly [_inner]: T,
}

function _Reactive<T extends object>(obj: T): Reactive<T> {
    const subject = new Subject<OneProp<T>>()
    const observable = subject.asObservable();
    const props: Record<keyof any, any> = {}
    const propsProxy = new Proxy({}, {
        get(_targ, _p, _recv) {
            const p = _p as keyof T
            if (!props[p]) {
                const propSubject = new BehaviorSubject(obj[p])
                observable.pipe(mergeMap(x => p in x ? of(x[p]) : NEVER)).subscribe(propSubject)
                props[p] = propSubject
            }

            return props[p]
        },
        set(target, p, newValue, receiver) {
            return false
        },
    });
    return new Proxy(obj, {
        get(target, p, receiver) {
            switch (p) {
                case _updates:
                    return observable
                case _props:
                    return propsProxy
                case _inner:
                    return target
                default:
                    return Reflect.get(target, p, receiver)
            }
        },
        set(target, p, newValue, receiver) {
            const old = (target as any)[p]
            const out = Reflect.set(target, p, newValue, receiver)
            out && old !== newValue && subject.next({ [p]: newValue } as OneProp<T>)
            return out
        },
    }) as Reactive<T>
}

namespace _Reactive {
    export function isReactive<T>(obj: T): obj is Reactive<T> {
        return obj != null && typeof obj == 'object' && (_updates as any)[obj]
    }

    export function updates<T>(obj: Reactive<T>): Observable<OneProp<T>> {
        return obj[_updates]
    }

    export function props<T>(obj: Reactive<T>): { [K in keyof T]: StateObservable<T[K]> } {
        return obj[_props]
    }

    export function inner<T>(obj: Reactive<T>): T & object {
        return obj[_inner] as T & object
    }
}

export const Reactive = _Reactive

export type UseReactive<T> = T extends Reactive<infer U> ? { readonly [K in keyof U]: UseReactive<U[K]> } : Readonly<T>

function observeReactive<T, U extends Reactive<T> = Reactive<T>>(target: U, update: () => void): [UseReactive<U>, Subscription] {
    const subject = new Subject<void>()
    const used: { [K in keyof T]?: boolean | [UseReactive<T[K]>, Subscription] } = {}
    const sub = new Subscription()
    sub.add(_Reactive.updates(target).subscribe(e => {
        for (let p in e) {
            const prop = p as keyof T
            const u = used[prop]
            if (u) {
                if (u instanceof Array) {
                    sub.remove(u[1])
                    u[1].unsubscribe()
                    used[prop] = true
                }
                update()
            }
            break
        }
    }))
    const proxy = new Proxy(Reactive.inner(target), {
        get(target, p, receiver) {
            const prop = p as keyof T
            const value = Reflect.get(target, p, receiver)
            if (Reactive.isReactive(value)) {
                let out: any
                const u = used[prop]
                if (u instanceof Array) {
                    out = u[0]
                } else {
                    let entry = observeReactive(value as any, update)
                    used[prop] = entry as any
                    sub.add(entry[1])
                    out = entry[0]
                }
                return out
            } else {
                used[prop] = true
                return value
            }
        },
        set(target, p, newValue, receiver) {
            return false
        },
    })
    return [proxy as any, sub]
}

export function useReactive<T>(target: Reactive<T>): UseReactive<Reactive<T>> {
    const obj = useRef<UseReactive<Reactive<T>>>()
    const [_state, setState] = useState({})

    useEffect(() => {
        const [out, sub] = observeReactive<T>(target, () => setState({}))
        obj.current = out
        return () => { sub.unsubscribe() }
    })

    return obj.current!
}
