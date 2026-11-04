import AgentIngestController from './AgentIngestController'
import AgentTerminalController from './AgentTerminalController'
import TerminalBridgeController from './TerminalBridgeController'

const Api = {
    AgentIngestController: Object.assign(AgentIngestController, AgentIngestController),
    AgentTerminalController: Object.assign(AgentTerminalController, AgentTerminalController),
    TerminalBridgeController: Object.assign(TerminalBridgeController, TerminalBridgeController),
}

export default Api