import { Observable, Subject } from 'rxjs'
import { OneProp } from './types'
import { StateObservable } from './rxUtils'

const _updates: unique symbol = Symbol()
const _props: unique symbol = Symbol()
const _inner: unique symbol = Symbol()

export type Reactive<T = any> = { [K in keyof T]: T[K] } & {
    readonly [_updates]: Observable<{ readonly prop: OneProp<T> }>,
    readonly [_props]: { [K in keyof T]: StateObservable<T[K]> },
    readonly [_inner]: T,
}

function _Reactive<T extends object>(obj: T): Reactive<T> {
    const subject = new Subject<any>()
    const proxy = new Proxy(obj, {
        set(target, p, newValue, receiver) {
            const out = Reflect.set(target, p, newValue, receiver)
            out && subject.next({ [p]: newValue })
            return out
        },
    })
}

namespace _Reactive {
    export function isReactive<T>(obj: T): obj is Reactive<T> {
        return obj != null && typeof obj == 'object' && (_updates as any)[obj]
    }

    export function updates<T>(obj: Reactive<T>): Observable<{ readonly prop: OneProp<T> }> {
        return obj[_updates]
    }

    export function props<T>(obj: Reactive<T>): { [K in keyof T]: StateObservable<T[K]> } {
        return obj[_props]
    }

    export function inner<T>(obj: Reactive<T>): T {
        return obj[_inner]
    }
}

export const Reactive = _Reactive
