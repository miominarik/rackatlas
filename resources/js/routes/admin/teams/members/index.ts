import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:121
* @route '/app/admin/teams/{team}/members'
*/
export const store = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/admin/teams/{team}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:121
* @route '/app/admin/teams/{team}/members'
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
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:121
* @route '/app/admin/teams/{team}/members'
*/
store.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:142
* @route '/app/admin/teams/{team}/members/{member}'
*/
export const update = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/admin/teams/{team}/members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:142
* @route '/app/admin/teams/{team}/members/{member}'
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
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:142
* @route '/app/admin/teams/{team}/members/{member}'
*/
update.put = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:158
* @route '/app/admin/teams/{team}/members/{member}'
*/
export const destroy = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/admin/teams/{team}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:158
* @route '/app/admin/teams/{team}/members/{member}'
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
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:158
* @route '/app/admin/teams/{team}/members/{member}'
*/
destroy.delete = (args: { team: number | { id: number }, member: number | { id: number } } | [team: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const members = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default members