import React from 'react'
import { Button, Card, Column, Rows, Text } from "./widgets/styled";
import { H1 } from './widgets/Heading';
import { ScrollView } from 'react-native';
import { Page } from './widgets/Page';
import { LobbyViewModel } from '../viewModels/LobbyViewModel';
import { useAttachViewModel } from '../viewModels/ViewModel';

export function Lobby({ viewModel }: { viewModel: LobbyViewModel }) {
    useAttachViewModel(viewModel)
    const isCreator = viewModel.joinCode == null

    return <Page>
        <H1>New Game</H1>
        <Text>Players in lobby:</Text>
        <Card style={{ flexShrink: 0.75, flexGrow: 1.0 }}>
            <ScrollView>
                <Column>
                    <Text>Foo</Text>
                    <Text>Bar</Text>
                    <Text>Baz</Text>
                </Column>
            </ScrollView>
        </Card>
        {
            isCreator ? <Text>Ready to start?</Text>
                : <Text>Waiting for the game to start.</Text>
        }
        <Rows style={{ flexWrap: 'wrap-reverse' }}>
            <Button onPress={() => viewModel.cancel()}>Cancel</Button>
            {isCreator && <Button>Start Game</Button>}
        </Rows>
    </Page>
}
