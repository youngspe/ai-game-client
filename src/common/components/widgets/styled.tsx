import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react'
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
        (_state: Rn.PressableStateCallbackType) => {
            const state = { enabled, ..._state }
            return [
                button(state),
                typeof style == 'function' ? style(state) : style,
            ]
        },
        [enabled, style],
    )

    return <Rn.Pressable
        onPress={enabled ? onPress : null}
        role='button'
        style={themeStyle}
        {...props}
    >{_state => {
        const state = { enabled, ..._state }
        return <Text style={[buttonText, typeof textStyle == 'function' ? textStyle(state) : textStyle]}>{children}</Text>
    }}
    </Rn.Pressable >
}

export namespace Button {
    export interface Props extends Omit<PropsWithChildren<Rn.PressableProps>, 'style'> {
        style?: Rn.ViewStyle | ((state: State) => Rn.StyleProp<Rn.ViewStyle>)
        textStyle?: Rn.TextStyle | ((state: State) => Rn.StyleProp<Rn.TextStyle>)
    }
    export interface State {
        pressed: boolean
        enabled: boolean
    }
}

export function RadioButton<T = unknown>({ value, state, children, style, textStyle, ...props }: RadioButton.Props<T>) {
    const { radioButton, radioButtonText } = useTheme(MyTheme)
    const selected = state.value === value

    return <Button
        onPress={selected ? null : (() => state.value = value)}
        style={_state => {
            const state = { selected, ..._state }
            return [radioButton(state), typeof style == 'function' ? style(state) : style]
        }}
        textStyle={_state => {
            const state = { selected, ..._state }
            return [radioButtonText(state), typeof textStyle == 'function' ? textStyle(state) : textStyle]
        }}
        {...props}
    >{children}</Button>
}

export namespace RadioButton {
    export interface Props<T> extends Omit<Button.Props, 'textStyle' | 'style' | 'onPress'> {
        style?: Rn.ViewStyle | ((state: State) => Rn.StyleProp<Rn.ViewStyle>)
        textStyle?: Rn.TextStyle | ((state: State) => Rn.StyleProp<Rn.TextStyle>)
        value: T
        state: StateRef<T>
    }

    export interface State extends Button.State {
        selected: boolean
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
    const [state, setState] = useState(init)
    const stateRef = {
        get value() { return state },
        set value(value) {
            setState(value)
            if (value !== undefined) { onSelect?.(value) }
        },
    }

    addProp(stateRef, 'RadioButton', { value: (props: Omit<RadioButton.Props<T>, 'state'>) => RadioButton({ state: stateRef, ...props }) })
    return stateRef
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
