import { useEffect } from 'react'

export interface Closeable {
    close(err?: unknown): void
}

class _Closeable implements Closeable {
    readonly close: (err?: unknown) => void
    constructor(close: (err?: unknown) => void) {
        this.close = close
    }
}

namespace _Closeable {
    export const noOp = { close() { } }
}

export function using<C extends Closeable, R>(closeable: C, block: (closeable: C) => R): R {
    try {
        const ret = block(closeable)
        closeable.close()
        return ret
    } catch (ex) {
        closeable.close(ex)
        throw ex
    }
}

export const Closeable = _Closeable

export function useCloseable<C extends Closeable>(closeable: C): C {
    useEffect(() => () => { closeable.close() }, [closeable])
    return closeable
}
