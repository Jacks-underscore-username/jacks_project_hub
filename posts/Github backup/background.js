const fontSize = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i).test(navigator.userAgent || navigator.vendor || window.opera) ? 50 : 25

let [width, height] = [0, 0]

let [lastWidth, lastHeight] = [0, 0]

const lineWidth = fontSize / 3

let flickerChance

let colorIndex
const colors = []
const setColor = ctx => {
    if (colors[colorIndex] === undefined)
        colors.push({ flickerTime: 0, color: '#0f0' })
    ctx.strokeStyle = ctx.fillStyle = colors[colorIndex].color
    if (colors[colorIndex].flickerTime === 0)
        ctx.shadowBlur = lineWidth * 2
    else
        ctx.shadowBlur = 0
    colorIndex++
}

const updateColors = () => {
    for (const color of colors) {
        if (color.flickerTime > 0) {
            color.flickerTime--
            if (color.flickerTime === 0)
                color.color = '#0f0'
        }
        else if (Math.random() < flickerChance) {
            color.flickerTime = Math.ceil(Math.random() * 50)
            color.color = `#00${Math.ceil(Math.random() * 12 * 11 + 12).toString(16).padStart(2, '0')}00`
        }
    }
}

let offsetIndex
const offsets = []
const getOffset = (lowerOffset, normal, upperOffset) => {
    if (upperOffset === undefined) upperOffset = lowerOffset
    if (offsets[offsetIndex] === undefined)
        offsets.push({ flickerTime: 0, min: normal - lowerOffset, normal, max: normal + upperOffset, value: normal })
    return offsets[offsetIndex++].value
}

const updateOffsets = () => {
    for (const offset of offsets) {
        if (offset.flickerTime > 0) {
            offset.flickerTime--
            if (offset.flickerTime === 0)
                offset.value = offset.normal
        }
        else if (Math.random() < flickerChance) {
            offset.flickerTime = Math.ceil(Math.random() * 50)
            offset.value = Math.random() * (offset.max - offset.min) + offset.min
        }
    }
}

const stars = new Array(100).fill(0).map(() => ({ x: Math.random(), y: Math.random(), size: Math.random(), parts: Math.round(Math.random() * 2) + 2, rotation: Math.random() }))

export function update(canvas, ctx) {
    if (lastWidth != window.innerWidth || lastHeight != innerHeight) {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
        ctx.font = `${fontSize}px 'Fira Code'`
        ctx.textBaseline = 'top'
    }
    lastWidth = window.innerWidth
    lastHeight = window.innerHeight

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    flickerChance = .1 ** ((Math.cos(Date.now() / 1000) + 1) / 2 * 5)

    colorIndex = 0
    updateColors()

    offsetIndex = 0
    updateOffsets()

    ctx.shadowColor = '#0f0'

    const size = Math.min(width, height)

    stars.forEach(star => {
        for (let index = 0; index < star.parts; index++) {
            setColor(ctx)
            ctx.beginPath()
            ctx.ellipse(width * star.x, height * star.y, size / 50 * star.size, size / 250 * star.size, Math.PI * (star.rotation + (index / star.parts)), 0, Math.PI * 2)
            ctx.fill()
            star.x += getOffset(.0001, 0)
            star.y += getOffset(.0001, 0)
        }
    })

    ctx.lineWidth = lineWidth

    const curve = (...args) => {
        args = args.map(value => value / 100 * size / 2)
        const offsetX = getOffset(size / 25, 0, size / 25)
        const offsetY = getOffset(size / 25, 0, size / 25)
        args = args.map((value, index) => value + (index % 2 === 0 ? offsetX : offsetY))
        setColor(ctx)
        ctx.beginPath()
        ctx.moveTo(width / 2 - args[6], height / 2 - args[7])
        ctx.bezierCurveTo(...args.map((value, index) => index % 2 === 0 ? width / 2 - value : height / 2 - value))
        ctx.stroke()
    }

    curve(52.95, 93.796, 95.833, 50.913, 95.833, -2.037, 0, 93.796)
    curve(95.833, -44.446, 68.4, -80.262, 30.308, -92.954, 95.833, -2.037)
    curve(25.516, -93.796, 23.725, -90.921, 23.725, -88.404, 30.308, -92.954)
    curve(23.725, -86.129, 23.842, -78.587, 23.842, -70.554, 23.725, -88.404)
    curve(47.916, -74.987, 54.142, -64.687, 56.058, -59.304, 23.842, -70.554)
    curve(57.141, -56.546, 61.808, -48.037, 65.892, -45.762, 56.058, -59.304)
    curve(69.241, -43.962, 74.033, -39.529, 66.008, -39.412, 65.892, -45.762)
    curve(58.458, -39.296, 53.066, -46.362, 51.266, -49.237, 66.008, -39.412)
    curve(42.642, -63.737, 29.7, -59.654, 24.192, -57.137, 51.266, -49.237)
    curve(23.358, -50.912, 20.008, -46.721, 17.25, -44.321, 24.192, -57.137)
    curve(38.575, -41.929, 60.85, -33.662, 60.85, 2.996, 17.25, -44.321)
    curve(60.85, 13.413, 57.141, 22.038, 51.033, 28.746, 60.85, 2.996)
    curve(51.991, 31.146, 55.341, 40.971, 50.075, 54.146, 51.033, 28.746)
    curve(50.075, 54.146, 42.05, 56.663, 23.716, 44.321, 50.075, 54.146)
    curve(16.05, 46.479, 7.908, 47.554, -0.234, 47.554, 23.716, 44.321)
    curve(-8.375, 47.554, -16.525, 46.479, -24.192, 44.321, -0.234, 47.554)
    curve(-42.525, 56.779, -50.542, 54.146, -50.542, 54.146, -24.192, 44.321)
    curve(-55.817, 40.971, -52.459, 31.146, -52.459, 28.746, -50.542, 54.146)
    curve(-58.567, 22.038, -62.284, 13.538, -62.284, 2.996, -52.459, 28.746)
    curve(-62.284, -33.779, -39.884, -41.921, -18.558, -44.321, -62.284, 2.996)
    curve(-22.034, -47.321, -25.025, -53.071, -25.025, -62.054, -18.558, -44.321)
    curve(-25.025, -74.871, -24.909, -85.171, -24.909, -88.404, -25.025, -62.054)
    curve(-24.909, -90.921, -26.709, -93.796, -31.492, -92.837, -24.909, -88.404)
    curve(-68.408, -80.262, -95.834, -44.321, -95.834, -2.037, -31.492, -92.837)
    curve(-95.834, 50.913, -52.95, 93.796, 0, 93.796, -95.834, -2.037)
}