import { Reactive } from "../utils/reactive";
import { ascribe } from "../utils/types";
import { MainMenuViewModel } from "./MainMenuViewModel";
import { BaseViewModel, ViewModel } from "./ViewModel";
import { Navigator } from "../utils/navigator";
import { TokenStore } from "../TokenStore";

export interface Device {
    window?: {
        readonly setBackground?: (color: string) => void
    }
    history?: {
        exit(): void
        onBackListener?: () => void
    }
    tokenStore?: TokenStore
    baseUrl: string,
}

export class AppModel implements Navigator {
    readonly deps: BaseViewModel.Deps = {
        navigator: this,
    }

    readonly props = Reactive({
        currentViewModel: ascribe<ViewModel>(new MainMenuViewModel(this.deps)),
    })

    readonly device: Device

    private _backStack: ViewModel[] = []

    constructor(device: Device) {
        this.device = device
        if (device.history) {
            device.history.onBackListener = () => this.back()
        }
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
}
