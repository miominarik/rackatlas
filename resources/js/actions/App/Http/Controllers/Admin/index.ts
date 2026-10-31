import ActivityController from './ActivityController'
import UserController from './UserController'
import TeamController from './TeamController'

const Admin = {
    ActivityController: Object.assign(ActivityController, ActivityController),
    UserController: Object.assign(UserController, UserController),
    TeamController: Object.assign(TeamController, TeamController),
}

export default Admin