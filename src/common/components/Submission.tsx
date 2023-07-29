import React, { useState } from 'react'
import { SubmissionViewModel } from '../viewModels/SubmissionViewModel';
import { useReactiveProp } from '../utils/Reactive';
import { Button, Card, Column, CountDown, H1, H2, H3, Page, Row, Text, TextInput, useRadioState } from './widgets';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useCountdownSeconds } from '../utils/rxUtils';
import { useAttachViewModel } from '../viewModels/ViewModel';
import { fade } from '../utils/color';
import { MyTheme, useTheme } from '../Theme';

export function Submission({ viewModel }: { viewModel: SubmissionViewModel }) {
    useAttachViewModel(viewModel)
    const state = viewModel._deps.state
    const roundNumber = useReactiveProp(state, 'gameState.round.number')
    const prompt = useReactiveProp(state, 'gameState.round.prompt')
    const suggestions = useReactiveProp(state, 'playerState.styleSuggestions')
    const [custom, setCustom] = useState('')
    const endTime = useReactiveProp(state, 'gameState.round.submissionEndTime')
    const StyleSelect = useRadioState<'custom' | number>()
    const submissionStyle = useReactiveProp(state, 'playerState.submission.style')
    const submissionOutput = useReactiveProp(state, 'playerState.submission.output')
    const { background } = useTheme(MyTheme)

    return <Page>
        <H1>Round {roundNumber}</H1>
        <CountDown endTime={endTime} />
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
                        style={{ flex: 1.0 }}
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
        <Row><Button onPress={() => {
            if (StyleSelect.value == null) return
            const style = StyleSelect.value == 'custom' ? custom : suggestions?.[StyleSelect.value]
            if (style != null) viewModel.selectStyle(style)
        }} disabled={StyleSelect.value == null}>Submit</Button></Row>

        {
            submissionStyle != null && <View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: fade(background, 1),
            }}>
                <Card style={{ margin: 'auto' }}>
                    <Column>
                        <H3>Submitted</H3>
                        <Text>Style: {submissionStyle}</Text>
                        <Text>{
                            submissionOutput == null ? 'Generating response...'
                                : `Response: ${submissionOutput}`
                        }</Text>
                    </Column>
                </Card>
            </View>
        }
    </Page>
}
