import React, { PropsWithChildren, useCallback, useState } from 'react'
import * as Rn from 'react-native'
import { MyTheme, useTheme } from '../../Theme'
import { fade } from '../../utils/color'
import { FlexItemStyle, MarginStyle } from '../../utils/styles'
import { StateRef, useStateRef } from '../../utils/rxUtils'
import { addProp } from '../../utils/types'

export function Button(
    { onPress, children, style, textStyle, disabled, ...props }: Button.Props,
) {
    const enabled = !disabled
    const { button, buttonText } = useTheme(MyTheme)
    const themeStyle = useCallback(
        (state: Rn.PressableStateCallbackType) => [
            button({ pressed: state.pressed, enabled }),
            typeof style == 'function' ? style(state) : style,
        ],
        [enabled, style],
    )

    return <Rn.Pressable
        onPress={onPress}
        role='button'
        style={themeStyle}
        {...props}
    >
        <Text style={[buttonText, textStyle]}>{children}</Text>
    </Rn.Pressable>
}

export namespace Button {
    export interface Props extends PropsWithChildren<Rn.PressableProps> {
        textStyle?: Rn.TextStyle
    }
}

export function RadioButton<T = unknown>({ value, state, children, disabled, ...props }: RadioButton.Props<T>) {
    return <Button
        disabled={disabled || state.value === value}
        onPress={() => state.value = value}
        {...props}
    >{children}</Button>
}

export namespace RadioButton {
    export interface Props<T> extends Omit<Button.Props, 'onPress'> {
        value: T
        state: StateRef<T>
    }
}

export interface RadioState<T = unknown> {
    RadioButton(props: Omit<RadioButton.Props<T>, 'state'>): JSX.Element
    value: T | undefined
}

export function useRadioState<T>({ init, onSelect }: {
    init?: T | (() => T),
    onSelect?: (value: T) => void,
} = {}): RadioState<T> {
    const state = useStateRef(init)
    addProp(state, 'RadioButton', { value: (props: Omit<RadioButton.Props<T>, 'state'>) => RadioButton({ state, ...props }) })
    return state
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
