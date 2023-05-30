import React from 'react'
import { MyTheme, ThemeProps } from './Theme'

export interface Device {
    window?: {
        setBackground?: (color: string) => void
    }
}

export default function App({ device }: { device: Device }) {
    let themeProps: ThemeProps<typeof MyTheme> = {
        accent: '#0080FF',
        background: '#101010',
        foreground: '#E8E8E8',
    }
    device.window?.setBackground?.(themeProps.background)

    return <MyTheme.Init {...themeProps}>

    </MyTheme.Init>
}


