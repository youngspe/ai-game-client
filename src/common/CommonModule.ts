import { TypeKey, Module } from "checked-inject";
import { ApiClient, DefaultApiClient } from "./ApiClient";
import { ViewModel } from "./viewModels/ViewModel";
import MainMenuViewModel from "./viewModels/MainMenuViewModel";

export abstract class HistoryManager {
    abstract exit(): void
    onBackListener?: () => void
}

export abstract class WindowManager {
    setBackground(color: string): void { }
}

export namespace CommonKeys {
    export class BaseUrls extends TypeKey<{ baseUrlHttp: string, baseUrlWs: string }>() { private _: any }
}

export class MainViewModelFactory extends TypeKey<() => ViewModel>() { private _: any }

export const CommonModule = Module(ct => ct
    .bind(ApiClient, DefaultApiClient)
    .bind(MainViewModelFactory, MainMenuViewModel.Factory)
)

