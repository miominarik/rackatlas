import AgentIngestController from './AgentIngestController'
import TerminalBridgeController from './TerminalBridgeController'

const Api = {
    AgentIngestController: Object.assign(AgentIngestController, AgentIngestController),
    TerminalBridgeController: Object.assign(TerminalBridgeController, TerminalBridgeController),
}

export default Api