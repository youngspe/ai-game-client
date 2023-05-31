import React from 'react'
import { Button, Text } from "./widgets/styled";
import { TextInput, View } from 'react-native';

export function MainMenu() {
    return <View style={{ marginHorizontal: 'auto', gap: 10 }}>
        <Text>Asdf</Text>
        <Button>Start a new game!</Button>
        <TextInput />
    </View>
}
