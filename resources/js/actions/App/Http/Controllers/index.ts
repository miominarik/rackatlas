import Api from './Api'
import DashboardController from './DashboardController'
import CurrentTeamController from './CurrentTeamController'
import Servers from './Servers'
import MetricsController from './MetricsController'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    DashboardController: Object.assign(DashboardController, DashboardController),
    CurrentTeamController: Object.assign(CurrentTeamController, CurrentTeamController),
    Servers: Object.assign(Servers, Servers),
    MetricsController: Object.assign(MetricsController, MetricsController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers