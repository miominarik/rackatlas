import TerminalController from './TerminalController'
import TerminalSessionController from './TerminalSessionController'

const Terminal = {
    TerminalController: Object.assign(TerminalController, TerminalController),
    TerminalSessionController: Object.assign(TerminalSessionController, TerminalSessionController),
}

export default Terminal