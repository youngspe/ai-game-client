import React from 'react'
import { Button, Card, Column, Rows, Text } from "./widgets/styled";
import { H1, H2 } from './widgets/Heading';
import { ScrollView } from 'react-native';
import { Page } from './widgets/Page';
import { LobbyViewModel } from '../viewModels/LobbyViewModel';
import { useAttachViewModel } from '../viewModels/ViewModel';
import { useReactiveProp } from '../utils/Reactive';

export function Lobby({ viewModel }: { viewModel: LobbyViewModel }) {
    useAttachViewModel(viewModel)
    const state = viewModel.args.state
    const userId = useReactiveProp(state, 'playerState.userId')
    const ownerId = useReactiveProp(state, 'gameState.ownerId')
    const gameId = useReactiveProp(state, 'gameState.gameId')
    const playerList = useReactiveProp(state, 'gameState.playerList')
    const isCreator = userId === ownerId

    return <Page>
        <H1>New Game</H1>
        <H2>Join Code: {gameId?.toUpperCase()}</H2>
        <Text>Players in lobby:</Text>
        <Card style={{ flexShrink: 0.75, flexGrow: 1.0 }}>
            <ScrollView>
                <Column>
                    {playerList?.map(p => <Text key={p.userId}>{p.displayName}</Text>)}
                </Column>
            </ScrollView>
        </Card>
        {
            isCreator ? <Text>Ready to start?</Text>
                : <Text>Waiting for the game to start.</Text>
        }
        <Rows style={{ flexWrap: 'wrap-reverse' }}>
            <Button onPress={() => viewModel.cancel()}>Cancel</Button>
            {isCreator && <Button onPress={() => viewModel.start()}>Start Game</Button>}
        </Rows>
    </Page>
}
