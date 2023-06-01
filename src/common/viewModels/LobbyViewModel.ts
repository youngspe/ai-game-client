import { Reactive } from "../utils/reactive";
import { MainMenuViewModel } from "./MainMenuViewModel";
import { BaseViewModel } from "./ViewModel";

export class LobbyViewModel extends BaseViewModel {
    readonly joinCode?: string
    constructor(deps: BaseViewModel.Deps, { joinCode }: { joinCode?: string }) {
        super(deps)
        this.joinCode = joinCode
    }
    cancel() { this.goBack() }
}
