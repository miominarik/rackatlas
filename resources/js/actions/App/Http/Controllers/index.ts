import Api from './Api'
import HomeController from './HomeController'
import PrivacyController from './PrivacyController'
import ApiDocsController from './ApiDocsController'
import FeedbackController from './FeedbackController'
import CrawlerController from './CrawlerController'
import Settings from './Settings'
import Auth from './Auth'
import DashboardController from './DashboardController'
import CurrentTeamController from './CurrentTeamController'
import Servers from './Servers'
import DatabaseController from './DatabaseController'
import MapController from './MapController'
import Terminal from './Terminal'
import ApplicationController from './ApplicationController'
import MetricsController from './MetricsController'
import MetricsProcessesController from './MetricsProcessesController'
import BackupController from './BackupController'
import Admin from './Admin'

const Controllers = {
    Api: Object.assign(Api, Api),
    HomeController: Object.assign(HomeController, HomeController),
    PrivacyController: Object.assign(PrivacyController, PrivacyController),
    ApiDocsController: Object.assign(ApiDocsController, ApiDocsController),
    FeedbackController: Object.assign(FeedbackController, FeedbackController),
    CrawlerController: Object.assign(CrawlerController, CrawlerController),
    Settings: Object.assign(Settings, Settings),
    Auth: Object.assign(Auth, Auth),
    DashboardController: Object.assign(DashboardController, DashboardController),
    CurrentTeamController: Object.assign(CurrentTeamController, CurrentTeamController),
    Servers: Object.assign(Servers, Servers),
    DatabaseController: Object.assign(DatabaseController, DatabaseController),
    MapController: Object.assign(MapController, MapController),
    Terminal: Object.assign(Terminal, Terminal),
    ApplicationController: Object.assign(ApplicationController, ApplicationController),
    MetricsController: Object.assign(MetricsController, MetricsController),
    MetricsProcessesController: Object.assign(MetricsProcessesController, MetricsProcessesController),
    BackupController: Object.assign(BackupController, BackupController),
    Admin: Object.assign(Admin, Admin),
}

export default Controllers