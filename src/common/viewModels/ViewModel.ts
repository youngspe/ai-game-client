import { Subscription, SubscriptionLike } from 'rxjs';
import { Closeable, useCloseable } from '../utils/Closeable';
import { Navigator } from '../utils/navigator';
import { useEffect } from 'react';
import { ApiClient } from '../ApiClient';
import { DependencyKey, Inject, Injectable, Target } from 'checked-inject';

export interface ViewModel {
    readonly navBehavior: ViewModel.NavBehavior
    readonly hideBehavior: ViewModel.HideBehavior
    readonly tag: {}
    attach(): Closeable
}

export namespace ViewModel {
    export type NavBehavior =
        | 'push'
        | 'replace'
        | 'unwind'

    export type HideBehavior =
        | 'retain'
        | 'discard'
}

export abstract class BaseViewModel extends Injectable implements ViewModel {
    protected onAttach?(sub: Subscription): void { }
    protected onDetach?(): void { }
    private _attachCount = 0
    private _sub = new Subscription()

    protected readonly baseDeps: BaseViewModel.BaseDeps
    protected get navigator() { return this.baseDeps.navigator }

    readonly navBehavior: ViewModel.NavBehavior = 'push'
    readonly hideBehavior: ViewModel.HideBehavior = 'retain'
    readonly tag: {} = Object.getPrototypeOf(this).constructor

    private readonly _detachCloseable = new Closeable(() => {
        this._attachCount -= 1
        if (this._attachCount == 0) {
            this.onDetach?.()
            this._sub.unsubscribe()
            this._sub = new Subscription()
        }
    })

    constructor(deps: BaseViewModel.BaseDeps) {
        super()
        this.baseDeps = deps
    }

    attach(): Closeable {
        if (this._attachCount == 0) {
            this.onAttach?.(this._sub)
        }
        this._attachCount += 1
        return this._detachCloseable
    }

    protected navigate<Vm extends ViewModel, Args extends any[] = []>(vm: Vm, ...args: Args) {
        this.baseDeps.navigator.open(vm)
    }

    protected goBack(): boolean {
        return this.baseDeps.navigator.back()
    }
}

export namespace BaseViewModel {
    export const BaseDeps = Inject.from({
        navigator: Navigator.Cyclic(),
    })
    export type BaseDeps = Target<typeof BaseDeps>
}

export function useAttachViewModel<V extends ViewModel>(viewModel: V): V {
    useCloseable(() => viewModel.attach(), [viewModel])
    return viewModel
}
