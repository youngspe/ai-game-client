import { BaseViewModel, ViewModel } from "./ViewModel";
import { LobbyViewModel } from "./LobbyViewModel";

export class MainMenuViewModel extends BaseViewModel {
    override navBehavior: ViewModel.NavBehavior = 'unwind'
    start() { this.navigate(LobbyViewModel, {}) }
    join(joinCode: string) { this.navigate(LobbyViewModel, { joinCode }) }
}
