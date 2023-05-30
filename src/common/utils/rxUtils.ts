import { useEffect, useRef } from 'react'
import { useObservable } from 'rxjs-hooks'
import { BehaviorSubject, Observable, switchMap } from 'rxjs'

export type StateObservable<T> = Observable<T> & { readonly value: T }

export function useStateObservable<T>(obs: StateObservable<T>) {
    useObservable((_state, input) => input.pipe(switchMap(([obs]) => obs)), obs.value, [obs])
}

export function useSubscribe<E>(f: (event: E) => void, obs: Observable<E>) {
    const ref = useRef(f)
    ref.current = f
    useEffect(() => {
        const sub = obs.subscribe(value => ref.current(value))
        return () => {
            sub.unsubscribe()
        }
    }, [obs])
}

export function collectState<T>(obs: Observable<T>, init: T): StateObservable<T> {
    const subject = new BehaviorSubject(init)
    obs.subscribe(subject)
    return subject
}
