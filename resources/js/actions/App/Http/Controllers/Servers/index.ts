import ServerController from './ServerController'
import TestConnectionController from './TestConnectionController'
import ServerAgentController from './ServerAgentController'
import LogController from './LogController'
import SshKeyController from './SshKeyController'
import ServerCategoryController from './ServerCategoryController'

const Servers = {
    ServerController: Object.assign(ServerController, ServerController),
    TestConnectionController: Object.assign(TestConnectionController, TestConnectionController),
    ServerAgentController: Object.assign(ServerAgentController, ServerAgentController),
    LogController: Object.assign(LogController, LogController),
    SshKeyController: Object.assign(SshKeyController, SshKeyController),
    ServerCategoryController: Object.assign(ServerCategoryController, ServerCategoryController),
}

export default Servers