import ProfileController from './ProfileController'
import LanguageController from './LanguageController'
import SecurityController from './SecurityController'
import DeviceController from './DeviceController'
import NotificationController from './NotificationController'
import NotificationDiagnosticsController from './NotificationDiagnosticsController'
import PushSubscriptionController from './PushSubscriptionController'
import TeamController from './TeamController'
import TeamMemberController from './TeamMemberController'
import TeamInvitationController from './TeamInvitationController'
import AcceptTeamInvitationController from './AcceptTeamInvitationController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    LanguageController: Object.assign(LanguageController, LanguageController),
    SecurityController: Object.assign(SecurityController, SecurityController),
    DeviceController: Object.assign(DeviceController, DeviceController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    NotificationDiagnosticsController: Object.assign(NotificationDiagnosticsController, NotificationDiagnosticsController),
    PushSubscriptionController: Object.assign(PushSubscriptionController, PushSubscriptionController),
    TeamController: Object.assign(TeamController, TeamController),
    TeamMemberController: Object.assign(TeamMemberController, TeamMemberController),
    TeamInvitationController: Object.assign(TeamInvitationController, TeamInvitationController),
    AcceptTeamInvitationController: Object.assign(AcceptTeamInvitationController, AcceptTeamInvitationController),
}

export default Settings