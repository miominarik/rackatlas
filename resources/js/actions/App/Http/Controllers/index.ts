import Api from './Api'
import DashboardController from './DashboardController'
import CurrentTeamController from './CurrentTeamController'
import Servers from './Servers'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    DashboardController: Object.assign(DashboardController, DashboardController),
    CurrentTeamController: Object.assign(CurrentTeamController, CurrentTeamController),
    Servers: Object.assign(Servers, Servers),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers