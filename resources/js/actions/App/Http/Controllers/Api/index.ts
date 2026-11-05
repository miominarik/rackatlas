import AgentIngestController from './AgentIngestController'
import AgentJournalController from './AgentJournalController'
import AgentTerminalController from './AgentTerminalController'
import TerminalBridgeController from './TerminalBridgeController'
import BackupWebhookController from './BackupWebhookController'
import V1 from './V1'

const Api = {
    AgentIngestController: Object.assign(AgentIngestController, AgentIngestController),
    AgentJournalController: Object.assign(AgentJournalController, AgentJournalController),
    AgentTerminalController: Object.assign(AgentTerminalController, AgentTerminalController),
    TerminalBridgeController: Object.assign(TerminalBridgeController, TerminalBridgeController),
    BackupWebhookController: Object.assign(BackupWebhookController, BackupWebhookController),
    V1: Object.assign(V1, V1),
}

export default Api