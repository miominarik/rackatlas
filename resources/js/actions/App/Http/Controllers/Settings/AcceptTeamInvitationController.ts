import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
const AcceptTeamInvitationController = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: AcceptTeamInvitationController.url(args, options),
    method: 'get',
})

AcceptTeamInvitationController.definition = {
    methods: ["get","head"],
    url: '/app/invitations/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
AcceptTeamInvitationController.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return AcceptTeamInvitationController.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
AcceptTeamInvitationController.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: AcceptTeamInvitationController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
AcceptTeamInvitationController.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: AcceptTeamInvitationController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
const AcceptTeamInvitationControllerForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AcceptTeamInvitationController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
AcceptTeamInvitationControllerForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AcceptTeamInvitationController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::__invoke
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:16
* @route '/app/invitations/{token}'
*/
AcceptTeamInvitationControllerForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AcceptTeamInvitationController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

AcceptTeamInvitationController.form = AcceptTeamInvitationControllerForm

export default AcceptTeamInvitationController