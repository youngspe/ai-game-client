import { Reactive } from "../utils/Reactive";
import { ascribe } from "../utils/types";
import { MainMenuViewModel } from "./MainMenuViewModel";
import { BaseViewModel, ViewModel } from "./ViewModel";
import { Navigator } from "../utils/navigator";
import { TokenStore } from "../TokenStore";
import { ApiClient, DefaultApiClient } from "../ApiClient";
import { CommonKeys, HistoryManager, MainViewModelFactory, WindowManager } from "../CommonModule";
import { Inject, Singleton, Target } from "checked-inject";

// TOOD: remove?
export class AppModel {
    readonly props: Reactive<{ currentViewModel: ViewModel }>

    constructor(fac: () => ViewModel, historyManager: HistoryManager, navigator: Navigator) {
        historyManager.onBackListener = () => navigator.back()
        this.props = Reactive({
            currentViewModel: ascribe<ViewModel>(fac()),
        })
    }

    static scope = Singleton
    static inject = Inject.construct(this, MainViewModelFactory, HistoryManager, Navigator)
}
