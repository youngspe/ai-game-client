import { Closeable, useCloseable } from '../utils/Closeable';

export interface ViewModel {
    attach(): Closeable
}

abstract class _ViewModel implements ViewModel {
    protected onAttach?(): void {}
    protected onDetach?(): void {}
    private _attachCount = 0
    private readonly _detachCloseable = new Closeable(() => {
        this._attachCount -= 1
        if (this._attachCount == 0) {
            this.onDetach?.()
        }
    })

    attach(): Closeable {
        if (this._attachCount == 0) {
            this.onAttach?.()
        }
        this._attachCount += 1
        return this._detachCloseable
    }
}

export const ViewModel = _ViewModel

export function useAttachViewModel<V extends ViewModel>(viewModel: V): V {
    useCloseable(viewModel.attach())
    return viewModel
}
