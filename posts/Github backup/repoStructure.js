{
    const testText = document.createElement('span')
    testText.textContent = '0'
    document.currentScript.insertAdjacentElement('afterend', testText)
    const font = window.getComputedStyle(testText).font
    const canvas = document.createElement('canvas')
    document.currentScript.insertAdjacentElement('afterend', canvas)
    canvas.style.verticalAlign = 'middle'
    const pixelRatio = window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    testText.remove()
    const exampleFolder = [
        {
            name: 'modules',
            id: 1,
            contents: [
                { name: 'colors.js', id: 2 },
                { name: 'physics.js', id: 3 },
                { name: 'animate.js', id: 4 }
            ]
        },
        { name: 'index.html', id: 5 },
        { name: 'styles.css', id: 6 },
        { name: 'script.js', id: 7 },
        {
            name: 'backup',
            id: 8,
            contents: [
                {
                    name: 'modules',
                    id: 9,
                    contents: [
                        { name: 'colors.js', link_id: 2, id: 10 },
                        { name: 'physics.js', link_id: 3, id: 11 },
                        { name: 'animate.js', link_id: 4, id: 12 }
                    ]
                },
                { name: 'index.html', link_id: 5, id: 13 },
                { name: 'styles.css', link_id: 6, id: 14 },
                { name: 'script.js', link_id: 7, id: 15 }
            ]
        },
    ]
    let width, height
    const resize = () => {
        width = Math.min(document.getElementById('post').getElementsByClassName('markup')[0].getBoundingClientRect().width, font.match(/([0-9]*)/)[1] / .030)
        height = width
        canvas.width = width * pixelRatio
        canvas.height = height * pixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(pixelRatio, pixelRatio)
        ctx.font = `${width * .030}px ${font.match(/[0-9]*px "(.*)"/)[1]}`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
    }
    window.addEventListener('resize', resize)
    resize()
    const mouse = { x: 0, y: 0, lastMoved: 0 }
    let lastTextLocations = []
    canvas.addEventListener('mousemove', event => [mouse.x, mouse.y, mouse.lastMoved] = [event.clientX - canvas.getBoundingClientRect().x, event.clientY - canvas.getBoundingClientRect().y, Date.now()])
    const render = () => {
        let [baseBorderColor, borderOpacity] = getComputedStyle(document.documentElement).getPropertyValue('--background-dark').match(/#([0-9a-f]*) r g b \/ ([0-9]*)/).slice(1, 3)
        if (baseBorderColor.length < 6) baseBorderColor = baseBorderColor.split('').map(char => `${char}${char}`).join('').slice(0, 6)
        if (borderOpacity.length === 1) borderOpacity = `${borderOpacity}${borderOpacity}`
        const borderColor = `#${baseBorderColor}${borderOpacity}`
        const borderWidth = getComputedStyle(document.getElementById('post')).getPropertyValue('border-width').match(/([0-9.]*)/)[1]
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = ctx.strokeStyle = borderColor
        ctx.fillRect(0, 0, width, height)
        ctx.lineWidth = borderWidth * 2
        ctx.lineCap = 'butt'
        ctx.strokeRect(0, 0, width, height)

        ctx.lineWidth = borderWidth

        ctx.beginPath()
        ctx.moveTo(width / 3, borderWidth)
        ctx.lineTo(width / 3, height - borderWidth)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(width / 3 * 2, borderWidth)
        ctx.lineTo(width / 3 * 2, height - borderWidth)
        ctx.stroke()

        let selectedItem = {}
        const highlights = []

        const textLocations = []

        if (Date.now() - mouse.lastMoved > 5000) {
            const position = lastTextLocations[Math.floor(Math.random() * lastTextLocations.length)]
            if (position) {
                mouse.x = position.x
                mouse.y = position.y
                mouse.lastMoved = Date.now() - 5000 + 250
            }
        }

        ctx.shadowColor = '#0f0'

        for (let renderIndex = 0; renderIndex < 2; renderIndex++) {

            let blobIndex = 0
            const blobs = []

            {
                let items = []
                const dumpFolder = (folder, depth = 0) => {
                    for (const item of folder)
                        if (item.contents) {
                            items.push(depth ? { ...item, name: ` ${new Array(depth).fill('*').join(' ')} ${item.name}` } : item)
                            dumpFolder(item.contents, depth + 1)
                        }
                        else {
                            if (!blobs.some(file => file.name === item.name)) {
                                blobs.push({ ...item, blobIndex })
                                blobIndex++
                            }
                            items.push(depth ? { ...item, name: ` ${new Array(depth).fill('*').join(' ')} ${item.name}` } : item)
                        }
                }
                dumpFolder(exampleFolder)
                items = items.map(item => ({ ...item, type: 'file' }))
                for (let index = 0; index < items.length; index++) {
                    const item = items[index]
                    const textSize = ctx.measureText(item.name)
                    const y = (index + .5) * (height / items.length)
                    if (
                        selectedItem.id === item.id ||
                        (selectedItem.link_id !== undefined && selectedItem.type !== 'file' && selectedItem.link_id === item.id) ||
                        (item.link_id !== undefined && selectedItem.type !== 'file' && selectedItem.id === item.link_id) ||
                        (item.link_id !== undefined && selectedItem.type !== 'file' && selectedItem.link_id === item.link_id) ||
                        (mouse.x >= 10 && mouse.x <= 10 + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2)) {
                        if (mouse.x >= 10 && mouse.x <= 10 + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2)
                            selectedItem = item
                        if (renderIndex) {
                            ctx.fillStyle = '#0f0'
                            ctx.shadowBlur = borderWidth * 2
                            highlights.push({ x: 10 + textSize.width / 2, y, type: 'file' })
                        }
                    }
                    else if (renderIndex)
                        ctx.fillStyle = '#fff'
                    if (renderIndex) {
                        textLocations.push({ x: 10 + textSize.width / 2, y })
                        ctx.fillText(item.name, 10, y)
                        ctx.shadowBlur = 0
                    }
                }
            }

            {
                let items = []

                let treeIndex = 0
                const trees = []
                const dumpFolder = (folder, inFolder) => {
                    const foundFolders = []
                    for (const item of folder)
                        if (item.contents) {
                            if (!trees.some(file => file.id === item.id)) {
                                trees.push({ ...item, treeIndex })
                                treeIndex++
                            }
                            items.push({ ...item, name: `${inFolder ? ' -> ' : ''}tree ${trees.find(file => file.id === item.id).treeIndex}` })
                            if (!inFolder) {
                                dumpFolder(item.contents, true)
                                foundFolders.push(item.contents)
                            }
                        }
                        else if (inFolder) {
                            items.push(inFolder ? { ...item, name: ` -> blob ${blobs.find(file => file.name === item.name).blobIndex}` } : item)

                        }
                    for (const folder of foundFolders)
                        dumpFolder(folder)
                }
                dumpFolder([{ name: 'wrapper', contents: exampleFolder, id: 0 }])
                items = items.map(item => ({ ...item, type: 'tree' }))
                for (let index = 0; index < items.length; index++) {
                    const item = items[index]
                    const textSize = ctx.measureText(item.name)
                    const x = width / 3 + 10
                    const y = (index + .5) * (height / items.length)
                    if (
                        selectedItem.id === item.id ||
                        (selectedItem.link_id !== undefined && selectedItem.link_id === item.id) ||
                        (item.link_id !== undefined && selectedItem.id === item.link_id) ||
                        (item.link_id !== undefined && selectedItem.link_id === item.link_id) ||
                        (mouse.x >= x && mouse.x <= x + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2)) {
                        if (mouse.x >= x && mouse.x <= x + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2)
                            selectedItem = item
                        if (renderIndex) {
                            ctx.fillStyle = '#0f0'
                            ctx.shadowBlur = borderWidth * 2
                            highlights.push({ x: x + textSize.width / 2, y, type: 'tree' })
                        }
                    }
                    else if (renderIndex)
                        ctx.fillStyle = '#fff'
                    if (renderIndex) {
                        textLocations.push({ x: x + textSize.width / 2, y })
                        ctx.fillText(item.name, x, y)
                        ctx.shadowBlur = 0
                    }
                }
            }

            {
                let items = []
                const dumpFolder = folder => {
                    for (const item of folder)
                        if (item.contents)
                            dumpFolder(item.contents, true)
                        else if (!items.some(subItem => subItem.id === item.id || subItem.link_id === item.id || subItem.id === item.link_id || subItem.link_id === item.link_id))
                            items.push({ ...item, name: `blob ${blobs.find(file => file.name === item.name).blobIndex}` })
                }
                dumpFolder(exampleFolder)
                items = items.map(item => ({ ...item, type: 'blob' }))
                for (let index = 0; index < items.length; index++) {
                    const item = items[index]
                    const textSize = ctx.measureText(items[index].name)
                    const x = width / 3 * 2 + 10
                    const y = (index + .5) * (height / items.length)
                    if (
                        selectedItem.id === item.id ||
                        (selectedItem.link_id !== undefined && selectedItem.link_id === item.id) ||
                        (item.link_id !== undefined && selectedItem.id === item.link_id) ||
                        (item.link_id !== undefined && selectedItem.link_id === item.link_id) ||
                        (mouse.x >= x && mouse.x <= x + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2)) {
                        if (mouse.x >= x && mouse.x <= x + textSize.width && mouse.y >= y - 15 / 2 && mouse.y <= y + 15 / 2) {
                            selectedItem = item
                        }
                        if (renderIndex) {
                            ctx.fillStyle = '#0f0'
                            ctx.shadowBlur = borderWidth * 2
                            highlights.push({ x: x + textSize.width / 2, y, type: 'blob' })
                        }
                    }
                    else if (renderIndex)
                        ctx.fillStyle = '#fff'
                    if (renderIndex) {
                        textLocations.push({ x: x + textSize.width / 2, y })
                        ctx.fillText(item.name, x, y)
                        ctx.shadowBlur = 0
                    }
                }
            }
        }

        ctx.lineCap = 'round'
        const f = (x, y, angle, distance) => {
            return [x + Math.cos(angle) * distance, y + Math.sin(angle) * distance]
        }

        const drawArrow = (highlight1, highlight2) => {
            const angle = Math.atan2(highlight1.y - highlight2.y, highlight1.x - highlight2.x)
            ctx.beginPath()
            ctx.moveTo(...f(highlight1.x, highlight1.y, angle, -15))
            ctx.lineTo(...f(highlight2.x, highlight2.y, angle, 15))
            ctx.moveTo(...f(highlight2.x, highlight2.y, angle, 15))
            ctx.lineTo(...f(highlight2.x, highlight2.y, angle - .25, 30))
            ctx.moveTo(...f(highlight2.x, highlight2.y, angle, 15))
            ctx.lineTo(...f(highlight2.x, highlight2.y, angle + .25, 30))
            ctx.strokeStyle = '#0006'
            ctx.lineWidth = borderWidth * 1.25
            ctx.stroke()
            ctx.strokeStyle = '#0f06'
            ctx.lineWidth = borderWidth
            ctx.stroke()
        }

        const drawLine = (highlight1, highlight2) => {
            const angle = Math.atan2(highlight1.y - highlight2.y, highlight1.x - highlight2.x)
            ctx.beginPath()
            ctx.moveTo(...f(highlight1.x, highlight1.y, angle, -15))
            ctx.lineTo(...f(highlight2.x, highlight2.y, angle, 15))
            ctx.strokeStyle = '#0006'
            ctx.lineWidth = borderWidth * 1.25
            ctx.stroke()
            ctx.strokeStyle = '#0f06'
            ctx.lineWidth = borderWidth
            ctx.stroke()
        }

        for (const highlight of highlights) {
            if (highlight.type === 'file')
                for (const subHighlight of highlights.filter(highlight => highlight.type === 'tree'))
                    drawArrow(highlight, subHighlight)
            if (highlight.type === 'tree') {
                for (const subHighlight of highlights.filter(highlight => highlight.type === 'blob'))
                    drawArrow(highlight, subHighlight)
                for (const subHighlight of highlights.filter(subHighlight => subHighlight.type === 'tree' && subHighlight !== highlight))
                    drawLine(highlight, subHighlight)
            }
        }

        lastTextLocations = textLocations
    }
    setInterval(render, 1000 / 30)
    render()
}