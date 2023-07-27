import React, { useState } from 'react'
import { Button, Hr, Row, Rows, Text, TextInput } from "./widgets/styled";
import { H1 } from './widgets/Heading';
import { Page } from './widgets/Page';
import MainMenuViewModel from '../viewModels/MainMenuViewModel';
import { useAttachViewModel } from '../viewModels/ViewModel';

export function MainMenu({ viewModel }: { viewModel: MainMenuViewModel }) {
    const [joinCode, setJoinCode] = useState('')
    const [displayName, setDisplayName] = useState('')

    useAttachViewModel(viewModel)
    return <Page>
        <H1>[untitled game]</H1>
        <Rows>
            <Text style={{ flexGrow: 0.25 }}>Enter your display name:</Text>
            <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder='Type your name here'
                style={{ flexGrow: 1 }}
            />
        </Rows>
        <Hr />
        <Row><Button
            disabled={!displayName}
            onPress={() => viewModel.start(displayName)}
        >Start a new game</Button></Row>
        <Hr />
        <Rows>
            <Text>Or join an existing game:</Text>
            <TextInput
                value={joinCode}
                onChangeText={setJoinCode}
                onSubmitEditing={e => setJoinCode(e.nativeEvent.text)}
                placeholder='Enter join code'
                style={{ flexGrow: 1 }}
            />
            <Button
                disabled={!joinCode || !displayName}
                style={{ flexGrow: 1, alignSelf: 'stretch' }}
                onPress={() => viewModel.join(joinCode, displayName)}
            >
                Join
            </Button>
        </Rows>
    </Page>
}
