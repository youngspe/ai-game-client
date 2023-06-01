import React, { PropsWithChildren } from 'react'
import * as Rn from 'react-native'
import { MyTheme, useTheme } from '../../Theme'
import { fade } from '../../utils/color'
import { FlexItemStyle, MarginStyle } from '../../utils/styles'

export function Button(
    { onPress, children, style, textStyle, ...props }: PropsWithChildren<Rn.PressableProps & { textStyle?: Rn.TextStyle }>,
) {
    const { button, buttonText } = useTheme(MyTheme)
    return <Rn.Pressable
        onPress={onPress}
        role='button'
        style={state => [
            button(state),
            typeof style == 'function' ? style(state) : style,
        ]}
        {...props}
    >
        <Text style={[buttonText, textStyle]}>{children}</Text>
    </Rn.Pressable>
}

export function Text({ style, children, ...props }: Rn.TextProps) {
    const { text } = useTheme(MyTheme)
    return <Rn.Text style={[text, style]} {...props}>{children}</Rn.Text>
}

export function TextInput({ style, ...props }: Rn.TextInputProps) {
    const { text, textInput, foreground } = useTheme(MyTheme)
    return <Rn.TextInput
        style={[text, textInput, style]}
        placeholderTextColor={props.placeholderTextColor ?? fade(foreground, 2)}
        {...props}
    />
}

export function Flex({ style, children, ...props }: Rn.ViewProps) {
    const { gap } = useTheme(MyTheme)
    return <Rn.View style={[{ gap }, style]} {...props}>{children}</Rn.View>
}

export function Row({ style, children, ...props }: Rn.ViewProps) {
    const { gap } = useTheme(MyTheme)
    return <Rn.View style={[{ gap, flexDirection: 'row' }, style]} {...props}>{children}</Rn.View>
}

export function Rows({ style, children, ...props }: Rn.ViewProps) {
    const { gap } = useTheme(MyTheme)
    return <Rn.View style={[{ gap, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, style]} {...props}>{children}</Rn.View>
}

export function Column({ style, children, ...props }: Rn.ViewProps) {
    const { gap } = useTheme(MyTheme)
    return <Rn.View style={[{ gap, flexDirection: 'column' }, style]} {...props}>{children}</Rn.View>
}

export interface HrStyle extends MarginStyle, FlexItemStyle { }

export function Hr({ style }: { style?: HrStyle }) {
    let { gap, foreground } = useTheme(MyTheme)
    return <Rn.View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: gap / 2,
        height: gap * 2,
        flexShrink: 1,
        flexGrow: 0.1,
    }, style]}>
        <Rn.View style={{
            width: '100%',
            alignSelf: 'center',
            borderBottomWidth: 1,
            borderBottomColor: fade(foreground, 4),
        }} />
    </Rn.View>
}

export function Card({ style, children, ...props }: Rn.TextProps) {
    const { card } = useTheme(MyTheme)
    return <Rn.View style={[card, style]} {...props}>{children}</Rn.View>
}
