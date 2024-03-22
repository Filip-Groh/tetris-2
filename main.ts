enum State {
    Preplay,
    Play,
    Win,
    Lost,
    ScoreWin,
    ScoreLost
}

enum InputType {
    A,
    B,
    Logo
}

enum RotationDirection {
    ClockWise,
    CounterClockWise
}

enum MoveType {
    RotateClockWise,
    RotateCounterClockWise,
    MoveLeft,
    MoveRight,
    MoveDown,
    Drop
}

type Point = {
    x: number,
    y: number
}



class Player {
    private shape: string
    private centerPoint: Point
    public pixels: Array<Point>
    private display: Display

    public constructor() {
        this.newShape()
    }

    public newShape() {
        const avalibleShapes = ["I", "O", "L", "J"]
        this.shape = avalibleShapes[Math.round(Math.random() * (avalibleShapes.length - 1))]
        this.pixels = []
        switch (this.shape) {
            case "I": {
                this.centerPoint = { x: 2, y: 0 }
                this.pixels.push({ x: 1, y: 0 })
                this.pixels.push({ x: 2, y: 0 })
                this.pixels.push({ x: 3, y: 0 })
                break
            }
            case "O": {
                this.centerPoint = { x: 1.5, y: 0.5 }
                this.pixels.push({ x: 1, y: 0 })
                this.pixels.push({ x: 2, y: 0 })
                this.pixels.push({ x: 1, y: 1 })
                this.pixels.push({ x: 2, y: 1 })
                break
            }
            case "L": {
                this.centerPoint = { x: 2.5, y: 0.5 }
                this.pixels.push({ x: 2, y: 0 })
                this.pixels.push({ x: 3, y: 0 })
                this.pixels.push({ x: 2, y: 1 })
                break
            }
            case "J": {
                this.centerPoint = { x: 2.5, y: 0.5 }
                this.pixels.push({ x: 2, y: 0 })
                this.pixels.push({ x: 3, y: 0 })
                this.pixels.push({ x: 3, y: 1 })
                break
            }
        }
    }

    public attachDisplay(display: Display) {
        this.display = display
    }

    public isCollision(): boolean {
        let isColliding = false
        this.pixels.forEach((value) => {
            if (value.x < 0 || value.x > this.display.sizeX - 1 || value.y < 0 || value.y > this.display.sizeY - 1 || this.display.getPixelState(value.x, value.y)) {
                isColliding = true
            }
        })
        return isColliding
    }

    public saveMove(move: MoveType): boolean {
        switch (move) {
            case MoveType.RotateClockWise: {
                this.rotate(RotationDirection.ClockWise)
                if (this.isCollision()) {
                    this.rotate(RotationDirection.CounterClockWise)
                    return true
                }
                break
            }
            case MoveType.RotateCounterClockWise: {
                this.rotate(RotationDirection.CounterClockWise)
                if (this.isCollision()) {
                    this.rotate(RotationDirection.ClockWise)
                    return true
                }
                break
            }
            case MoveType.MoveLeft: {
                this.moveOnXBy(-1)
                if (this.isCollision()) {
                    this.moveOnXBy(1)
                    return true
                }
                break
            }
            case MoveType.MoveRight: {
                this.moveOnXBy(1)
                if (this.isCollision()) {
                    this.moveOnXBy(-1)
                    return true
                }
                break
            }
            case MoveType.MoveDown: {
                this.moveOnYBy(1)
                if (this.isCollision()) {
                    this.moveOnXBy(-1)
                    return true
                }
                break
            }
            case MoveType.Drop: {
                break
            }
        }
        return false
    }

    public moveOnXBy(move: number) {
        this.pixels.forEach((value) => {
            value.x += move
        })
        this.centerPoint.x += move
    }

    public rotate(direction: RotationDirection) {
        // Rotation Matrix
        const angleInRad = (direction - 0.5) * 90 * Math.PI / 180
        this.pixels.forEach((value, index) => {
            const relativeX = this.centerPoint.x - value.x
            const relativeY = this.centerPoint.y - value.y
            const rotatedX = relativeX * Math.cos(angleInRad) - relativeY * Math.sin(angleInRad)
            const rotatedY = relativeX * Math.sin(angleInRad) + relativeY * Math.cos(angleInRad)
            value.x = Math.round(this.centerPoint.x + rotatedX)
            value.y = Math.round(this.centerPoint.y + rotatedY)
        })
    }

    public moveOnYBy(move: number) {
        this.pixels.forEach((value) => {
            value.y += move
        })
        this.centerPoint.y += move
    }
}

class Display {
    private displayGrid: Array<Array<boolean>>
    public sizeX: number
    public sizeY: number
    private player: Player

    public constructor(sizeX: number = 5, sizeY: number = 5) {
        this.sizeX = sizeX
        this.sizeY = sizeY

        for (let y = 0; y < this.sizeY; y++) {
            this.displayGrid.push(this.createLine())
        }
    }

    private createLine(): Array<boolean> {
        let line: Array<boolean>
        for (let x = 0; x < this.sizeX; x++) {
            line.push(false)
        }
        return line
    }

    public attachPlayer(player: Player) {
        this.player = player
    }

    public display() {
        this.displayGrid.forEach((yArray, y) => {
            yArray.forEach((xValue, x) => {
                if (xValue) {
                    led.plot(x, y)
                } else {
                    led.unplot(x, y)
                }
            })
        })
    }

    public getPixelState(x: number, y: number): boolean {
        return this.displayGrid[y][x]
    }

    public removeLines() {
        let fullLines: Array<number> = []
        this.displayGrid.forEach((yArray, y) => {
            let line = this.createLine()
            yArray.forEach((xValue, x) => {
                if (xValue) {
                    line[x] = this.displayGrid[y][x]
                }
            })
            let isFullLine = line.every((value) => {
                return value
            })
            if (isFullLine) {
                fullLines.push(y)
            }
        })

        fullLines.forEach((value) => {
            this.displayGrid[value] = this.createLine()
            for (let i = value; i > 0; i--) {
                this.displayGrid[i] = this.displayGrid[i - 1]
            }
        })
    }

    public plot() {
        this.player.pixels.forEach((value) => {
            this.displayGrid[value.y][value.x] = true
        })
    }
}

class InputHandler {
    public onButtonRelease: () => void
    public onButtonPress: () => void
}

class GameLoop {
    private display: Display
    private player: Player
    private score: number
    private state: State
    private lastStateChange: number

    public init() {
        this.display = new Display(5, 5)
        this.player = new Player()
        this.display.attachPlayer(this.player)
        this.player.attachDisplay(this.display)

        this.score = 0
        this.state = State.Preplay
        this.lastStateChange = control.millis()
    }

    public frame() {
        switch (this.state) {
            case State.Preplay: {
                if (control.millis() - this.lastStateChange > 3000) {
                    this.setState(State.Play)
                }
                break
            }
            case State.Play: {
                break
            }
            case State.Win: {
                break
            }
            case State.Lost: {
                break
            }
            case State.ScoreWin: {
                break
            }
            case State.ScoreLost: {
                break
            }
        }
    }

    public setState(state: State) {
        this.state = state
        this.lastStateChange = control.millis()
        basic.clearScreen()
    }
}

let gameLoop = new GameLoop()
gameLoop.init()

basic.forever(() => {
    gameLoop.frame()
    basic.pause(1 / 60)
})



const frequence = 60
const animationTime = 3000
const rotationDirection = 90 // 90 - CCW, -90 - CW
const scoreTable = {
    one: 5,
    two: 15,
    three: 25
}

const dropTimeTable = {
    under40: 2000,
    under80: 1200,
    under100: 800
}

function updateState(newState: State): void {
    if (newState === State.Play) {
        score = 0
        playedGames += 1
        lastDrop = control.millis() + animationTime
        gameStartTime = control.millis()
        globalGamePlotArray = [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false]
        ]
        globalCurrentShape = processNewShape(globalGamePlotArray)
    }
    gameState = newState
}

function processNewShape(gamePlotArray: Array<Array<boolean>>): Shape {
    let currentShape = generateShape()
    const isColliding = checkCollision(gamePlotArray, currentShape)
    if (isColliding) {
        updateState(State.Lost)
    }
    return currentShape
}

let score = 0
let playedGames = 0
let lastDrop = control.millis() + animationTime
let gameStartTime = control.millis()
let gameState = State.Play
let globalGamePlotArray = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
]
let globalCurrentShape: Shape = processNewShape(globalGamePlotArray)
basic.forever(function () {
    if (control.millis() - gameStartTime < animationTime) {
        whaleysans.showNumber(playedGames)
        return
    }
    switch (gameState) {
        case State.Play: {
            if (score === 99) {
                updateState(State.Win)
                break
            }
            display(plotShape(globalGamePlotArray, globalCurrentShape))
            let dropTime
            if (score < 40) {
                dropTime = dropTimeTable.under40
            } else if (score < 80) {
                dropTime = dropTimeTable.under80
            } else {
                dropTime = dropTimeTable.under100
            }
            if (control.millis() - lastDrop > dropTime) {
                const output = dropBlock(globalGamePlotArray, globalCurrentShape)
                globalCurrentShape = output.currentShape
                globalGamePlotArray = output.gamePlotArray
                lastDrop = control.millis()
            }
            break
        }
        case State.Win: {
            basic.showIcon(IconNames.Happy)
            break
        }
        case State.Lost: {
            display(plotShape(globalGamePlotArray, globalCurrentShape))
            break
        }
        case State.ScoreWin: {
            whaleysans.showNumber(score)
            break
        }
        case State.ScoreLost: {
            whaleysans.showNumber(score)
            break
        }
    }

    basic.pause(1 / frequence)
})

function processInput(buttonType: InputType, gamePlotArray: Array<Array<boolean>>, currentShape: Shape): Shape {
    switch (gameState) {
        case State.Play: {
            switch (buttonType) {
                case InputType.A: {
                    currentShape = moveOnXBy(gamePlotArray, currentShape, -1)
                    break
                }
                case InputType.B: {
                    currentShape = moveOnXBy(gamePlotArray, currentShape, 1)
                    break
                }
                case InputType.Logo: {
                    const beforeMoveShape = copy(currentShape)
                    currentShape = rotation(currentShape, rotationDirection)
                    if (checkCollision(gamePlotArray, currentShape)) {
                        currentShape = beforeMoveShape
                    }
                    break
                }
            }
            break
        }
        case State.Win: {
            updateState(State.ScoreWin)
            break
        }
        case State.Lost: {
            updateState(State.ScoreLost)
            break
        }
        case State.ScoreWin: {
            updateState(State.Win)
            break
        }
        case State.ScoreLost: {
            updateState(State.Lost)
            break
        }
    }
    return currentShape
}

input.onButtonPressed(Button.A, function () {
    if (control.millis() - gameStartTime < animationTime) {
        return
    }
    globalCurrentShape = processInput(InputType.A, globalGamePlotArray, globalCurrentShape)
})

input.onButtonPressed(Button.B, function () {
    if (control.millis() - gameStartTime < animationTime) {
        return
    }
    globalCurrentShape = processInput(InputType.B, globalGamePlotArray, globalCurrentShape)
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (control.millis() - gameStartTime < animationTime) {
        return
    }
    switch (gameState) {
        case State.Play: {
            globalCurrentShape = processInput(InputType.Logo, globalGamePlotArray, globalCurrentShape)
            break
        }
        default: {
            updateState(State.Play)
            break
        }
    }
})