import React, { PropsWithChildren, useContext, useMemo } from 'react'
import { createContext } from 'react'
import { PixelRatio, PressableStateCallbackType, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { ColorString, fade } from './utils/color'


export interface Theme<in Props = never, out Styles extends {} = {}> {
    Init(props: Props): React.JSX.Element
    use(): Styles
}

export type ThemeProps<Th> = Th extends Theme<infer P, any> ? P : never

export function createTheme<Props extends object & { children?: never }, Styles extends {}>(create: (props: Props) => Styles): Theme<Props, Styles> {
    const ThemeContext = createContext<Styles | null>(null)

    return {
        Init({ children, ...props }: PropsWithChildren<Props>): React.JSX.Element {
            return <ThemeContext.Provider value={create(props as Props)}>{children}</ThemeContext.Provider>
        },
        use(): Styles {
            const styles = useContext(ThemeContext)
            if (styles == null) throw new Error()
            return styles
        },
    }
}

export function useTheme<Styles extends {}>(theme: Theme<never, Styles>): Styles {
    return theme.use()
}

function style<B>() {
    return function <T extends B>(value: T) {
        return value
    }
}

function scale(x: number) {
    return x * PixelRatio.getFontScale()
}

export const MyTheme = createTheme(({ accent, background, foreground }: { accent: ColorString, background: ColorString, foreground: ColorString }) => {
    return useMemo(() => {
        const fontSize = scale(16)
        const paddingHorizontal = scale(8)
        const paddingVertical = scale(4)
        const gap = scale(8)

        const textContainerAttrs = {
            borderRadius: scale(6),
            paddingHorizontal,
            paddingVertical,
        }

        return {
            button: ({ pressed, enabled }: { pressed: boolean, enabled: boolean }) => style<ViewStyle>()({
                opacity: enabled ? 1.0 : 0.5,
                backgroundColor: pressed ? background : accent,
                borderWidth: 1,
                borderColor: foreground,
                flexGrow: 1,
                alignItems: 'stretch',
                ...textContainerAttrs,
            }),
            buttonText: style<TextStyle>()({
                textAlign: 'center',
                fontWeight: 'bold',
            }),
            text: style<TextStyle>()({
                color: foreground,
            }),
            textInput: style<TextStyle>()({
                borderColor: foreground,
                borderWidth: scale(1),
                backgroundColor: background,
                ...textContainerAttrs,

            }),
            heading: (level: number) => style<TextStyle>()({
                textAlign: 'center',
                fontSize: fontSize * (1 + 0.5 ** level),
            }),
            card: style<ViewStyle>()({
                backgroundColor: fade(foreground, 5),
                borderRadius: gap,
                borderWidth: 1,
                borderColor: fade(foreground, 4),
                padding: gap,
            }),
            paddingHorizontal,
            paddingVertical,
            gap: scale(12),
            fontSize,
            accent,
            background,
            foreground,
        }
    }, [accent, background, foreground])
})
