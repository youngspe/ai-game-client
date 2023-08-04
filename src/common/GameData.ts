import { Inject, Scope, Target, TypeKey } from "checked-inject"
import { EventStream } from "./ApiClient";
import { Reactive } from "./utils/Reactive";
import { GameState, PlayerState } from "../proto/GameState";
import { GameStateManager } from "./GameStateManager";

export class GameScope extends Scope() { private _: any }

export namespace GameData {
    export class Stream extends TypeKey<EventStream>() { private _: any }
    export const State = class extends TypeKey({
        default: Inject.map(GameStateManager, gsm => gsm.props),
    }) { private _: any; static scope = () => GameScope }
    export type State = Target<typeof State>
}

export const GameComponent = Inject.subcomponent((ct, stream: EventStream) => ct
    .addScope(GameScope)
    .provideInstance(GameData.Stream, stream)
)
