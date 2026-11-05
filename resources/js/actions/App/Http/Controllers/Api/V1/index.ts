import MeController from './MeController'
import ServerController from './ServerController'
import ServerMetricController from './ServerMetricController'
import ApplicationController from './ApplicationController'
import BackupController from './BackupController'
import AlertController from './AlertController'

const V1 = {
    MeController: Object.assign(MeController, MeController),
    ServerController: Object.assign(ServerController, ServerController),
    ServerMetricController: Object.assign(ServerMetricController, ServerMetricController),
    ApplicationController: Object.assign(ApplicationController, ApplicationController),
    BackupController: Object.assign(BackupController, BackupController),
    AlertController: Object.assign(AlertController, AlertController),
}

export default V1