import { Reactive } from "../utils/Reactive";
import { ascribe } from "../utils/types";
import MainMenuViewModel from "./MainMenuViewModel";
import { BaseViewModel, ViewModel } from "./ViewModel";
import { Navigator } from "../utils/navigator";
import { TokenStore } from "../TokenStore";
import { ApiClient, DefaultApiClient } from "../ApiClient";
import { CommonKeys, HistoryManager, WindowManager } from "../CommonModule";
import { Inject, Target } from "checked-inject";


export const DeviceKey = Inject.from({
    window: WindowManager,
    history: HistoryManager,
    tokenStore: TokenStore,
    baseUrls: CommonKeys.BaseUrls,
})

export type Device = Target<typeof DeviceKey>



export class AppModel implements Navigator {
    readonly deps: BaseViewModel.Deps

    readonly props: Reactive<{ currentViewModel: ViewModel }>

    private _backStack: ViewModel[] = []

    constructor() {
        device.history.onBackListener = () => this.back()
        this.props = Reactive({
            currentViewModel: ascribe<ViewModel>(new MainMenuViewModel(this.deps)),
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
            this.device.history?.exit()
            return true
        }

        this.props.currentViewModel = old
        return false
    }

    readonly navigator = this

    static inject = Inject.construct(this, ApiClient)
}
