import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
export const show = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/invitations/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
show.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
show.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
show.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
const showForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
showForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::show
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:18
* @route '/app/invitations/{token}'
*/
showForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::accept
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:35
* @route '/app/invitations/{token}'
*/
export const accept = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/app/invitations/{token}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::accept
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:35
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
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::accept
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:35
* @route '/app/invitations/{token}'
*/
accept.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::accept
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:35
* @route '/app/invitations/{token}'
*/
const acceptForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AcceptTeamInvitationController::accept
* @see app/Http/Controllers/Settings/AcceptTeamInvitationController.php:35
* @route '/app/invitations/{token}'
*/
acceptForm.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

const AcceptTeamInvitationController = { show, accept }

export default AcceptTeamInvitationController