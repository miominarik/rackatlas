import AgentIngestController from './AgentIngestController'
import AgentTerminalController from './AgentTerminalController'
import TerminalBridgeController from './TerminalBridgeController'
import BackupWebhookController from './BackupWebhookController'

const Api = {
    AgentIngestController: Object.assign(AgentIngestController, AgentIngestController),
    AgentTerminalController: Object.assign(AgentTerminalController, AgentTerminalController),
    TerminalBridgeController: Object.assign(TerminalBridgeController, TerminalBridgeController),
    BackupWebhookController: Object.assign(BackupWebhookController, BackupWebhookController),
}

export default Api