import { Subscription, SubscriptionLike } from 'rxjs';
import { Closeable, useCloseable } from '../utils/Closeable';
import { Navigator } from '../utils/navigator';
import { useEffect } from 'react';

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

export abstract class BaseViewModel<Deps extends BaseViewModel.Deps = BaseViewModel.Deps> implements ViewModel {
    protected onAttach?(sub: Subscription): void { }
    protected onDetach?(): void { }
    private _attachCount = 0
    private _sub = new Subscription()

    protected readonly deps: Deps
    protected get navigator() { return this.deps.navigator }

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

    constructor(deps: Deps) {
        this.deps = deps
    }

    attach(): Closeable {
        if (this._attachCount == 0) {
            this.onAttach?.(this._sub)
        }
        this._attachCount += 1
        return this._detachCloseable
    }

    protected initViewModel<Vm, Args extends any[]>(
        ctor: new (deps: Deps, ...args: Args) => Vm,
        ...args: Args
    ): Vm {
        return new ctor(this.deps, ...args)
    }

    protected navigate<Vm extends ViewModel, Args extends any[] = []>(
        vm: Vm | (new (deps: Deps, ...args: Args) => Vm),
        ...args: Args
    ) {
        if (typeof vm == 'function') {
            return this.deps.navigator.open(new vm(this.deps, ...args))
        } else {
            return this.deps.navigator.open(vm)
        }
    }

    protected goBack(): boolean {
        return this.deps.navigator.back()
    }
}

export namespace BaseViewModel {
    export interface Deps {
        navigator: Navigator,
    }
}

export function useAttachViewModel<V extends ViewModel>(viewModel: V): V {
    useCloseable(() => viewModel.attach(), [viewModel])
    return viewModel
}
