import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TeamMemberController::update
* @see app/Http/Controllers/Settings/TeamMemberController.php:19
* @route '/app/settings/teams/{team}/members/{member}'
*/
export const update = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/app/settings/teams/{team}/members/{member}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::update
* @see app/Http/Controllers/Settings/TeamMemberController.php:19
* @route '/app/settings/teams/{team}/members/{member}'
*/
update.url = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return update.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::update
* @see app/Http/Controllers/Settings/TeamMemberController.php:19
* @route '/app/settings/teams/{team}/members/{member}'
*/
update.patch = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::update
* @see app/Http/Controllers/Settings/TeamMemberController.php:19
* @route '/app/settings/teams/{team}/members/{member}'
*/
const updateForm = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::update
* @see app/Http/Controllers/Settings/TeamMemberController.php:19
* @route '/app/settings/teams/{team}/members/{member}'
*/
updateForm.patch = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::destroy
* @see app/Http/Controllers/Settings/TeamMemberController.php:34
* @route '/app/settings/teams/{team}/members/{member}'
*/
export const destroy = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/teams/{team}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::destroy
* @see app/Http/Controllers/Settings/TeamMemberController.php:34
* @route '/app/settings/teams/{team}/members/{member}'
*/
destroy.url = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return destroy.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::destroy
* @see app/Http/Controllers/Settings/TeamMemberController.php:34
* @route '/app/settings/teams/{team}/members/{member}'
*/
destroy.delete = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::destroy
* @see app/Http/Controllers/Settings/TeamMemberController.php:34
* @route '/app/settings/teams/{team}/members/{member}'
*/
const destroyForm = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TeamMemberController::destroy
* @see app/Http/Controllers/Settings/TeamMemberController.php:34
* @route '/app/settings/teams/{team}/members/{member}'
*/
destroyForm.delete = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const members = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default members