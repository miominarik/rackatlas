import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::store
* @see app/Http/Controllers/Settings/TeamInvitationController.php:20
* @route '/app/settings/teams/{team}/invitations'
*/
export const store = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/settings/teams/{team}/invitations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::store
* @see app/Http/Controllers/Settings/TeamInvitationController.php:20
* @route '/app/settings/teams/{team}/invitations'
*/
store.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return store.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::store
* @see app/Http/Controllers/Settings/TeamInvitationController.php:20
* @route '/app/settings/teams/{team}/invitations'
*/
store.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::store
* @see app/Http/Controllers/Settings/TeamInvitationController.php:20
* @route '/app/settings/teams/{team}/invitations'
*/
const storeForm = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::store
* @see app/Http/Controllers/Settings/TeamInvitationController.php:20
* @route '/app/settings/teams/{team}/invitations'
*/
storeForm.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::resend
* @see app/Http/Controllers/Settings/TeamInvitationController.php:42
* @route '/app/settings/teams/{team}/invitations/{invitation}/resend'
*/
export const resend = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(args, options),
    method: 'post',
})

resend.definition = {
    methods: ["post"],
    url: '/app/settings/teams/{team}/invitations/{invitation}/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::resend
* @see app/Http/Controllers/Settings/TeamInvitationController.php:42
* @route '/app/settings/teams/{team}/invitations/{invitation}/resend'
*/
resend.url = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            invitation: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
        invitation: typeof args.invitation === 'object'
        ? args.invitation.id
        : args.invitation,
    }

    return resend.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::resend
* @see app/Http/Controllers/Settings/TeamInvitationController.php:42
* @route '/app/settings/teams/{team}/invitations/{invitation}/resend'
*/
resend.post = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::resend
* @see app/Http/Controllers/Settings/TeamInvitationController.php:42
* @route '/app/settings/teams/{team}/invitations/{invitation}/resend'
*/
const resendForm = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::resend
* @see app/Http/Controllers/Settings/TeamInvitationController.php:42
* @route '/app/settings/teams/{team}/invitations/{invitation}/resend'
*/
resendForm.post = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(args, options),
    method: 'post',
})

resend.form = resendForm

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::destroy
* @see app/Http/Controllers/Settings/TeamInvitationController.php:61
* @route '/app/settings/teams/{team}/invitations/{invitation}'
*/
export const destroy = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/teams/{team}/invitations/{invitation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::destroy
* @see app/Http/Controllers/Settings/TeamInvitationController.php:61
* @route '/app/settings/teams/{team}/invitations/{invitation}'
*/
destroy.url = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            invitation: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
        invitation: typeof args.invitation === 'object'
        ? args.invitation.id
        : args.invitation,
    }

    return destroy.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::destroy
* @see app/Http/Controllers/Settings/TeamInvitationController.php:61
* @route '/app/settings/teams/{team}/invitations/{invitation}'
*/
destroy.delete = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::destroy
* @see app/Http/Controllers/Settings/TeamInvitationController.php:61
* @route '/app/settings/teams/{team}/invitations/{invitation}'
*/
const destroyForm = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamInvitationController::destroy
* @see app/Http/Controllers/Settings/TeamInvitationController.php:61
* @route '/app/settings/teams/{team}/invitations/{invitation}'
*/
destroyForm.delete = (args: { team: number | { id: number }, invitation: number | { id: number } } | [team: number | { id: number }, invitation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const TeamInvitationController = { store, resend, destroy }

export default TeamInvitationController