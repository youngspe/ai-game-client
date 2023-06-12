import React from "react"
import { TextProps } from "react-native"
import { H2 } from "."
import { useCountdownSeconds } from "../../utils/rxUtils"

export function CountDown({ endTime, ...props }: { endTime?: Date | number | null } & Omit<TextProps, 'children'>) {
    const countDown = useCountdownSeconds(endTime)
    return <H2>{(countDown == null || countDown < 0) ? '--' : countDown}</H2>
}
