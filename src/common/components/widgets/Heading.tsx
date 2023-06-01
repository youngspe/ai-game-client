import React from 'react'
import { TextProps } from "react-native";
import { Text } from "./styled";
import { MyTheme, useTheme } from '../../Theme';

export function Heading({ level, children, style, ...props }: { level: number } & TextProps) {
    const { heading } = useTheme(MyTheme)
    return <Text style={[heading(level), style]} role='heading' {...props}>{children}</Text>
}

export function H1({ children, ...props }: TextProps) {
    return <Heading level={1} {...props}>{children}</Heading>
}

export function H2({ children, ...props }: TextProps) {
    return <Heading level={2} {...props}>{children}</Heading>
}

export function H3({ children, ...props }: TextProps) {
    return <Heading level={3} {...props}>{children}</Heading>
}

export function H4({ children, ...props }: TextProps) {
    return <Heading level={4} {...props}>{children}</Heading>
}

export function H5({ children, ...props }: TextProps) {
    return <Heading level={5} {...props}>{children}</Heading>
}

export function H6({ children, ...props }: TextProps) {
    return <Heading level={6} {...props}>{children}</Heading>
}
