import React from 'react'
import { GameModel as GameViewModel } from "../viewModels/GameModel";
import { useStateObservable } from '../utils/rxUtils';
import { LobbyViewModel } from '../viewModels/LobbyViewModel';
import { Lobby } from './Lobby';
import { useAttachViewModel } from '../viewModels/ViewModel';

export function GameContainer({ viewModel }: { viewModel: GameViewModel }) {
    useAttachViewModel(viewModel)
    const childVm = useStateObservable(viewModel.childViewModel)

    if (childVm instanceof LobbyViewModel) return <Lobby viewModel={childVm} />
    return <></>
}
