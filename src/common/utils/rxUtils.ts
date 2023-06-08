import { useEffect, useRef } from 'react'
import { useObservable } from 'rxjs-hooks'
import { BehaviorSubject, NEVER, Observable, OperatorFunction, filter, map, mergeMap, of, switchMap } from 'rxjs'

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

export function filterNotNull<T>(): OperatorFunction<T, NonNullable<T>> {
    function isNotNull(x: T): x is NonNullable<T> {
        return x != null
    }
    return filter(isNotNull)
}

export function mapNotNull<T, U>(f: (item: T, index: number) => U): OperatorFunction<T, NonNullable<U>> {
    return mergeMap((item, index) => {
        const out = f(item, index)
        if (out != null) return of(out)
        return NEVER
    })
}

export function filterIsInstance<T>(cls: new (...args: any) => T): OperatorFunction<unknown, T> {
    return mergeMap(item => item instanceof cls ? of(item) : NEVER)
}

export function asyncValues<T>(obs: Observable<T>): AsyncIterableIterator<T> {
    const buffer: T[] = []
    let resolver: ((item: [T] | null) => void) | null = null
    let done = false

    const sub = obs.subscribe({
        next(value) {
            if (resolver) {
                resolver([value])
                resolver = null
            } else {
                buffer.push(value)
            }
        },
        complete() {
            done = true
            resolver?.(null)
            resolver = null
        },
    })

    return (async function* asyncValues() {
        try {
            while (true) {
                while (buffer.length > 0) {
                    const [value] = buffer.splice(0, 1)
                    yield value
                }

                if (done) return 0

                const out = await new Promise<[T] | null>(res => {
                    resolver = res
                })

                if (out == null) return
            }
        } finally {
            sub.unsubscribe()
        }
    })()
}
