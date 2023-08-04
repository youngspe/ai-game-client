import { DependencyKey, FactoryKey, Target } from "checked-inject";
import { BaseViewModel } from "../viewModels/ViewModel";

export const ViewModelFactoryKey = <
    Deps extends DependencyKey[],
    Ctor extends new (base: BaseViewModel.BaseDeps, ...rest: [...deps: Target<Deps>, ...args: Args]) => T,
    T = InstanceType<Ctor>,
    Args extends any[] =
    Ctor extends (new (base: BaseViewModel.BaseDeps, ...rest: [...deps: Target<Deps>, ...args: infer A]) => any) ? A : never
>(
    ctor: Ctor,
    ...deps: Deps
) => FactoryKey({
    get base() { return BaseViewModel.BaseDeps },
    deps,
}, ({ base, deps }, ...args: Args) => new ctor(base, ...[...deps, ...args]))
