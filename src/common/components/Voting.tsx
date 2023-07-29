import React from 'react'
import { VotingViewModel } from "../viewModels/VotingViewModel"
import { useAttachViewModel } from '../viewModels/ViewModel'
import { Button, Card, Column, CountDown, H1, H2, H3, Hr, Page, Row, Text } from './widgets'
import { useReactiveProp } from '../utils/Reactive'
import { useCountdownSeconds } from '../utils/rxUtils'
import { ScrollView } from 'react-native'

export function Voting({ viewModel }: { viewModel: VotingViewModel }) {
    useAttachViewModel(viewModel)
    const state = viewModel.state
    const mySubmission = useReactiveProp(state, 'playerState.submission')
    const submissions = useReactiveProp(state, 'gameState.round.submissions') ?? {}
    const votes = useReactiveProp(state, 'playerState.votes') ?? {}
    const roundNumber = useReactiveProp(state, 'gameState.round.number')
    const endTime = useReactiveProp(state, 'gameState.round.judgmentEndTime')
    const subIds = useReactiveProp(viewModel.props, 'submissionOrder')
    const votesRemaining = useReactiveProp(viewModel.props, 'votesRemaining')

    return <Page>
        <H1>Round {roundNumber}</H1>
        <CountDown endTime={endTime} />
        <ScrollView style={{ flexGrow: 1.0 }}>
            <H3>Your submission:</H3>
            <Card>
                <H3>{mySubmission?.style}</H3>
                <Text>{mySubmission?.output}</Text>
            </Card>
            <Hr />
            <H3>Vote for your favorites:</H3>
            {subIds.map(subId => {
                const voteCount = votes[subId] ?? 0
                return <Row key={subId}>
                    <Card style={{ flex: 1.0 }}>
                        <H3>{submissions[subId]?.style}</H3>
                        <Text>{submissions[subId]?.output}</Text>
                    </Card>
                    <Column>
                        <Button disabled={votesRemaining == 0} onPress={() => viewModel.vote(subId, true)}>+</Button>
                        <Text style={{ textAlign: 'center' }}>{voteCount}</Text>
                        <Button disabled={voteCount == 0} onPress={() => viewModel.vote(subId, false)}>-</Button>
                    </Column>
                </Row>
            })}
        </ScrollView>
    </Page>
}
