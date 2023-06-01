import React from 'react'
import { View, ViewProps, useWindowDimensions } from 'react-native'
import { Column } from './styled'
import { MyTheme, useTheme } from '../../Theme'

export function Page({ style, children, ...props }: ViewProps) {
    const { height } = useWindowDimensions()
    const { paddingHorizontal, paddingVertical } = useTheme(MyTheme)
    return <View style={{ flexDirection: 'row' }}>
        <Column
            style={[{
                marginHorizontal: 'auto',
                maxHeight: height,
                // height: height * 0.5
                minHeight: Math.min(400, height),
                maxWidth: 600,
                alignSelf: 'stretch',
                flexShrink: 1,
                flexGrow: 1,
                paddingHorizontal: paddingHorizontal * 2,
                paddingVertical,
            }, style]}
            {...props}
        >
            {children}
        </Column>
    </View >
}
