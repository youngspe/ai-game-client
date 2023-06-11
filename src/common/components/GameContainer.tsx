import React from 'react'
import { GameModel as GameViewModel } from "../viewModels/GameModel";
import { useStateObservable } from '../utils/rxUtils';
import { LobbyViewModel } from '../viewModels/LobbyViewModel';
import { Lobby } from './Lobby';
import { useAttachViewModel } from '../viewModels/ViewModel';
import { Loading } from './Loading';
import { useReactiveProp } from '../utils/Reactive';
import { SubmissionViewModel } from '../viewModels/SubmissionViewModel';
import { Submission } from './Submission';

export function GameContainer({ viewModel }: { viewModel: GameViewModel }) {
    useAttachViewModel(viewModel)
    const childVm = useStateObservable(viewModel.childViewModel)
    const roundNumber = useReactiveProp(viewModel.props, 'gameState.round.number')
    const title = roundNumber == null ? '[untitled game]' : `Round ${roundNumber}`

    if (childVm instanceof LobbyViewModel) return <Lobby viewModel={childVm} />
    if (childVm instanceof SubmissionViewModel) return <Submission viewModel={childVm} />
    return <Loading title={title} />
}
