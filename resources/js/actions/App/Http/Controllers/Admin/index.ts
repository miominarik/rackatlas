import UserController from './UserController'
import TeamController from './TeamController'

const Admin = {
    UserController: Object.assign(UserController, UserController),
    TeamController: Object.assign(TeamController, TeamController),
}

export default Admin