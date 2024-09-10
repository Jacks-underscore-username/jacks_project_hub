//The standard size used for text based backgrounds.
const fontSize = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i).test(navigator.userAgent || navigator.vendor || window.opera) ? 50 : 25
let fontWidth = fontSize

let [width, height] = [0, 0]

let [lastWidth, lastHeight] = [0, 0]

//This grabs the exposed stats.
fetch('../../mem.json')
    .then(response => response.json())
    .then(data => {
    })
    .catch(error => {
        console.error('Error fetching mem:', error)
    })

const wheels = []

const createWheel = () => wheels.push({
    x: Math.random() * width,
    y: Math.random() * height,
    direction: Math.random() * 360,
    flipped: Math.random() < .5,
    spokes: Math.floor(Math.random() * 8) + 2,
    radius: Math.random() * fontSize * 7.5 + fontSize * 2.5,
    speed: Math.random() * 10 + 5,
    age: 0
})

createWheel()

const movePoint = (x, y, angle, distance) => {
    angle = angle * Math.PI / 180
    x += Math.sin(angle) * distance
    y += Math.cos(angle) * distance
    return { x, y, arr: [x, y] }
}

const targetWheels = 5

//This is the renderloop.
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

    ctx.lineWidth = fontSize / 5

    if (wheels.length < targetWheels)
        createWheel()

    for (let wheelIndex = 0; wheelIndex < wheels.length; wheelIndex++) {
        const wheel = wheels[wheelIndex]

        ctx.strokeStyle = `#00ff00${Math.min(wheel.age, 255).toString(16).padStart(2, '0')}`

        const [cx, cy] = movePoint(wheel.x, wheel.y, wheel.direction + 90 + wheel.flipped * 180, wheel.radius).arr

        ctx.beginPath()
        ctx.arc(cx, cy, wheel.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, wheel.radius / 5, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        for (let index = 0; index < wheel.spokes; index++) {
            ctx.moveTo(...movePoint(cx, cy, 360 / wheel.spokes * index + (wheel.age * wheel.speed / Math.PI / 2) * (wheel.flipped ? 1 : -1), wheel.radius / 5).arr)
            ctx.lineTo(...movePoint(cx, cy, 360 / wheel.spokes * index + (wheel.age * wheel.speed / Math.PI / 2) * (wheel.flipped ? 1 : -1), wheel.radius).arr)
        }
        ctx.stroke()

        const grad = ctx.createRadialGradient(wheel.x, wheel.y, 0, wheel.x, wheel.y, wheel.radius * 2)
        grad.addColorStop(0, ctx.strokeStyle)
        grad.addColorStop(1, '#0000')
        ctx.strokeStyle = ctx.fillStyle = grad

        ctx.beginPath()
        ctx.moveTo(...movePoint(wheel.x, wheel.y, wheel.direction, wheel.radius * 2).arr)
        ctx.lineTo(...movePoint(wheel.x, wheel.y, wheel.direction + 180, wheel.radius * 2).arr)
        ctx.stroke()
        ctx.lineTo(...movePoint(...movePoint(wheel.x, wheel.y, wheel.direction + 180, wheel.radius * 2).arr, wheel.direction + (wheel.flipped ? 90 : 270), wheel.radius).arr)
        ctx.lineTo(...movePoint(...movePoint(wheel.x, wheel.y, wheel.direction, wheel.radius * 2).arr, wheel.direction + (wheel.flipped ? 90 : 270), wheel.radius).arr)
        ctx.fill()

        if (wheel.x + wheel.radius * 2 < 0 || wheel.y + wheel.radius * 2 < 0 || wheel.x - wheel.radius * 2 > canvas.width || wheel.y - wheel.radius * 2 > canvas.height) {
            wheels.splice(wheels.indexOf(wheel), 1)
            wheelIndex--
        }
        ;
        [wheel.x, wheel.y] = movePoint(wheel.x, wheel.y, wheel.direction, wheel.speed).arr
        wheel.age++
    }
}


export function start(canvas, ctx) {
    ctx.font = `${fontSize}px 'Fira Code'`
    fontWidth = ctx.measureText('0').width

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}