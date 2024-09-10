{
    //The text to display.
    const text = 'Hello World!'

    //All this gets the styles, creates the canvas, styles is, and cleans everything up.
    const testText = document.createElement('span')
    testText.textContent = '0'
    document.currentScript.insertAdjacentElement('afterend', testText)
    const style = window.getComputedStyle(testText)
    const canvas = document.createElement('canvas')
    document.currentScript.insertAdjacentElement('afterend', canvas)
    canvas.style.verticalAlign = 'middle'
    const boundingBox = testText.getBoundingClientRect()
    boundingBox.width *= text.length
    const ratio = window.devicePixelRatio
    canvas.width = boundingBox.width * ratio
    canvas.height = boundingBox.height * ratio
    canvas.style.width = boundingBox.width + 'px'
    canvas.style.height = boundingBox.height + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.font = style.font
    testText.remove()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    //Here you do the actual rendering.
    ctx.fillStyle = '#fff'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillText(text, 0, boundingBox.height / 2)
}