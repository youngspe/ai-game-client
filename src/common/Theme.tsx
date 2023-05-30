import React, { PropsWithChildren, useContext, useMemo } from 'react'
import { createContext } from 'react'
import { PressableStateCallbackType, StyleSheet, TextStyle, ViewStyle } from 'react-native'


export interface Theme<in Props = never, out Styles extends {} = {}> {
    Init(props: Props): React.JSX.Element
    use(): Styles
}

export type ThemeProps<Th> = Th extends Theme<infer P, any> ? P : never

export function createTheme<Props extends object & { children?: never }, Styles extends {}>(create: (props: Props) => Styles): Theme<Props, Styles> {
    const ThemeContext = createContext<Styles | null>(null)

    return {
        Init(props: PropsWithChildren<Omit<Props, 'children'>>): React.JSX.Element {
            return <ThemeContext.Provider value={create(props as Props)}></ThemeContext.Provider>
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

function bound<B>() {
    return function <T extends B>(value: T) {
        return value
    }
}

export const MyTheme = createTheme(({ accent, background, foreground }: { accent: string, background: string, foreground: string }) => {
    return useMemo(() => ({
        button: ({ pressed }: PressableStateCallbackType) => bound<ViewStyle>()({
            backgroundColor: accent,
            borderRadius: 4,
        }),
        text: bound<TextStyle>()({
            color: foreground,
        }),
    }), [accent, background, foreground])
})


