import React, { useState } from 'react'
import { SubmissionViewModel } from '../viewModels/SubmissionViewModel';
import { useReactiveProp } from '../utils/Reactive';
import { Button, Card, Column, H1, H2, Page, Row, Text, TextInput, useRadioState } from './widgets';
import { ScrollView } from 'react-native';
import { useCountdownSeconds } from '../utils/rxUtils';

export function Submission({ viewModel }: { viewModel: SubmissionViewModel }) {
    const state = viewModel.args.state
    const roundNumber = useReactiveProp(state, 'gameState.round.number')
    const prompt = useReactiveProp(state, 'gameState.round.prompt')
    const suggestions = useReactiveProp(state, 'playerState.styleSuggestions')
    const [custom, setCustom] = useState('')
    const endTime = useReactiveProp(state, 'gameState.round.submissionEndTime')
    const countDown = useCountdownSeconds(new Date(endTime ?? 0))
    const StyleSelect = useRadioState<'custom' | number>()

    return <Page>
        <H1>Round {roundNumber}</H1>
        <H2>{endTime == null ? '' : countDown}</H2>
        <Text>Choose a style for this prompt:</Text>
        <Card><Text>{prompt}</Text></Card>
        <ScrollView
            style={{ flexShrink: 0.75, flexGrow: 1.0 }}
            contentContainerStyle={{ justifyContent: 'flex-end' }}
        >
            <Column>
                {suggestions?.map((s, i) => (
                    <Row key={i} >
                        <StyleSelect.RadioButton value={i}>Select</StyleSelect.RadioButton>
                        <Text>{s}</Text>
                    </Row>
                ))}
                <Row>
                    <StyleSelect.RadioButton value='custom' disabled={!custom}>Select</StyleSelect.RadioButton>
                    <TextInput
                        placeholder='Create your own!'
                        value={custom}
                        onChangeText={t => {
                            if (t == '') {
                                if (StyleSelect.value == 'custom') {
                                    StyleSelect.value = undefined
                                }
                            } else {
                                StyleSelect.value = 'custom'
                            }
                            setCustom(t)
                        }}
                    />
                </Row>
            </Column>
        </ScrollView>
        <Button onPress={() => {
            if (StyleSelect.value == null) return
            const style = StyleSelect.value == 'custom' ? custom : suggestions?.[StyleSelect.value]
            if (style != null) viewModel.selectStyle(style)
        }}>Submit</Button>
    </Page>
}
