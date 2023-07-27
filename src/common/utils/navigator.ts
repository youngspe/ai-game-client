import { Inject, Singleton } from "checked-inject";
import { HistoryManager, MainViewModelFactory } from "../CommonModule";
import { ViewModel } from "../viewModels/ViewModel";
import { Reactive } from "./Reactive";
import { ascribe } from "./types";

export abstract class Navigator {
    abstract open(vm: ViewModel): void
    abstract back(): boolean
}

export class DefaultNavigator extends Navigator {
    readonly props: Reactive<{ currentViewModel: ViewModel }>

    private readonly _backStack: ViewModel[] = []
    private readonly _historyManager: HistoryManager;

    constructor(historyManager: HistoryManager, mainViewModelFac: () => ViewModel) {
        super()
        this._historyManager = historyManager
        this._historyManager.onBackListener = () => this.back()
        this.props = Reactive({
            currentViewModel: mainViewModelFac(),
        })
    }

    open(vm: ViewModel): void {
        if (this.props.currentViewModel.hideBehavior == "retain") {
            this._backStack.push(this.props.currentViewModel)
        }
        this.props.currentViewModel = vm
        let deleteCount: number | undefined

        switch (vm.navBehavior) {
            case 'push':
                deleteCount = 0
                break
            case 'replace':
                deleteCount = 1
            case 'unwind':
                deleteCount = undefined
                break
        }

        if (deleteCount != 0) {
            const tag = vm.tag

            let i = this._backStack.length - 1

            while (i >= 0) {
                if (this._backStack[i].tag === tag) break
                --i
            }

            if (i >= 0) {
                this._backStack.splice(i, deleteCount)
            }
        }
    }

    back(): boolean {
        let old = this._backStack.pop()
        if (old == null) {
            this._historyManager?.exit()
            return true
        }

        this.props.currentViewModel = old
        return false
    }

    static Scope = Singleton
    static inject = Inject.construct(this, HistoryManager, MainViewModelFactory)
}
