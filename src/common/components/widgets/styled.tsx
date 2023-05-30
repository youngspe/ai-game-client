import React, { PropsWithChildren } from 'react'
import { Pressable, PressableProps, Text as ReactText, TextProps, TextStyle } from 'react-native'
import { MyTheme, useTheme } from '../../Theme'

export function Button(
    { onPress, children, style, textStyle, ...props }: PropsWithChildren<PressableProps & { textStyle: TextStyle }>,
) {
    const { button } = useTheme(MyTheme)
    return <Pressable
        onPress={onPress}
        accessibilityRole='button'
        style={state => [
            button(state),
            typeof style == 'function' ? style(state) : style,
        ]}
        {...props}
    >
        <Text style={textStyle}>{children}</Text>
    </Pressable>
}

export function Text({ style, ...props }: TextProps) {
    const { text } = useTheme(MyTheme)
    return <ReactText style={[text, style]} {...props} />
}
