import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
export const accept = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accept.url(args, options),
    method: 'get',
})

accept.definition = {
    methods: ["get","head"],
    url: '/app/invitations/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
accept.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return accept.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
accept.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accept.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
accept.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: accept.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
const acceptForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: accept.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
acceptForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: accept.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
acceptForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: accept.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

accept.form = acceptForm

const teamInvitations = {
    accept: Object.assign(accept, accept),
}

export default teamInvitations