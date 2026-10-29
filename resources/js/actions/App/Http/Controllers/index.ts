import Api from './Api'
import HomeController from './HomeController'
import Settings from './Settings'
import DashboardController from './DashboardController'
import CurrentTeamController from './CurrentTeamController'
import Servers from './Servers'
import MetricsController from './MetricsController'

const Controllers = {
    Api: Object.assign(Api, Api),
    HomeController: Object.assign(HomeController, HomeController),
    Settings: Object.assign(Settings, Settings),
    DashboardController: Object.assign(DashboardController, DashboardController),
    CurrentTeamController: Object.assign(CurrentTeamController, CurrentTeamController),
    Servers: Object.assign(Servers, Servers),
    MetricsController: Object.assign(MetricsController, MetricsController),
}

export default Controllers