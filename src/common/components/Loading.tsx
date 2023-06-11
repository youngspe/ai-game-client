import React from 'react'
import { Page, H1, Text } from './widgets'

export function Loading({ title }: { title: string }) {
    return <Page>
        <H1>{title}</H1>
        <Text>Loading...</Text>
    </Page>
}
