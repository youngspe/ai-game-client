export type ColorString = `#${string}`

type Rgba = [r: number, g: number, b: number, a: number]

function hexToRgba(x: ColorString): Rgba {
    return [
        Number.parseInt(x.slice(1, 3), 16),
        Number.parseInt(x.slice(3, 5), 16),
        Number.parseInt(x.slice(5, 7), 16),
        x.length == 9 ? Number.parseInt(x.slice(7, 9), 16) : 255,
    ]
}

function stringifyChannel(x: number) {
    x = Math.min(255, Math.max(0, Math.round(x)))
    let s = x.toString(16)
    if (s.length == 1) {
        s = '0' + s
    }
    return s
}

function rgbaToHex(rgba: Rgba): ColorString {
    return `#${rgba.map(stringifyChannel).join('')}`
}

function blendRgba(a: Rgba, b: Rgba, fac: number) {
    return a.map((a1, i) => a1 + (b[i] - a1) * fac) as Rgba
}

const WHITE: Rgba = [255, 255, 255, 255]
const BLACK: Rgba = [0, 0, 0, 255]

/**
 *
 *
 * @param {ColorString} color
 * @param {number} level [0, 5]
 * @returns
 */
export function tint(color: ColorString, level: number): ColorString {
    return rgbaToHex(blendRgba(hexToRgba(color), WHITE, level / 6))
}

/**
 *
 *
 * @param {ColorString} color
 * @param {number} level [0, 5]
 * @returns
 */
export function shade(color: ColorString, level: number): ColorString {
    return rgbaToHex(blendRgba(hexToRgba(color), BLACK, level / 6))
}


/**
 *
 *
 * @param {ColorString} color
 * @param {number} level [0, 5]
 * @returns
 */
export function fade(color: ColorString, level: number): ColorString {
    const rgba = hexToRgba(color)
    rgba[3] *= 1 - level / 6
    return rgbaToHex(rgba)
}
