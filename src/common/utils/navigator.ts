import { ViewModel } from "../viewModels/ViewModel";

export interface Navigator {
    open(vm: ViewModel): void
    back(): boolean
}
