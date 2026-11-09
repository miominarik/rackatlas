import Api from './Api'
import HomeController from './HomeController'
import PrivacyController from './PrivacyController'
import ApiDocsController from './ApiDocsController'
import FeedbackController from './FeedbackController'
import CrawlerController from './CrawlerController'
import Settings from './Settings'
import DashboardController from './DashboardController'
import CurrentTeamController from './CurrentTeamController'
import Servers from './Servers'
import DatabaseController from './DatabaseController'
import DatabaseProcessController from './DatabaseProcessController'
import RedisController from './RedisController'
import RedisSwitchoverController from './RedisSwitchoverController'
import MapController from './MapController'
import Terminal from './Terminal'
import ApplicationController from './ApplicationController'
import MetricsController from './MetricsController'
import MetricsProcessesController from './MetricsProcessesController'
import BackupController from './BackupController'
import DocumentController from './DocumentController'
import Admin from './Admin'

const Controllers = {
    Api: Object.assign(Api, Api),
    HomeController: Object.assign(HomeController, HomeController),
    PrivacyController: Object.assign(PrivacyController, PrivacyController),
    ApiDocsController: Object.assign(ApiDocsController, ApiDocsController),
    FeedbackController: Object.assign(FeedbackController, FeedbackController),
    CrawlerController: Object.assign(CrawlerController, CrawlerController),
    Settings: Object.assign(Settings, Settings),
    DashboardController: Object.assign(DashboardController, DashboardController),
    CurrentTeamController: Object.assign(CurrentTeamController, CurrentTeamController),
    Servers: Object.assign(Servers, Servers),
    DatabaseController: Object.assign(DatabaseController, DatabaseController),
    DatabaseProcessController: Object.assign(DatabaseProcessController, DatabaseProcessController),
    RedisController: Object.assign(RedisController, RedisController),
    RedisSwitchoverController: Object.assign(RedisSwitchoverController, RedisSwitchoverController),
    MapController: Object.assign(MapController, MapController),
    Terminal: Object.assign(Terminal, Terminal),
    ApplicationController: Object.assign(ApplicationController, ApplicationController),
    MetricsController: Object.assign(MetricsController, MetricsController),
    MetricsProcessesController: Object.assign(MetricsProcessesController, MetricsProcessesController),
    BackupController: Object.assign(BackupController, BackupController),
    DocumentController: Object.assign(DocumentController, DocumentController),
    Admin: Object.assign(Admin, Admin),
}

export default Controllers