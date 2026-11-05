import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\ApiTokenController::store
* @see app/Http/Controllers/Settings/ApiTokenController.php:17
* @route '/app/settings/teams/{team}/api-tokens'
*/
export const store = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/settings/teams/{team}/api-tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::store
* @see app/Http/Controllers/Settings/ApiTokenController.php:17
* @route '/app/settings/teams/{team}/api-tokens'
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
* @see \App\Http\Controllers\Settings\ApiTokenController::store
* @see app/Http/Controllers/Settings/ApiTokenController.php:17
* @route '/app/settings/teams/{team}/api-tokens'
*/
store.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::store
* @see app/Http/Controllers/Settings/ApiTokenController.php:17
* @route '/app/settings/teams/{team}/api-tokens'
*/
const storeForm = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::store
* @see app/Http/Controllers/Settings/ApiTokenController.php:17
* @route '/app/settings/teams/{team}/api-tokens'
*/
storeForm.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::destroy
* @see app/Http/Controllers/Settings/ApiTokenController.php:40
* @route '/app/settings/teams/{team}/api-tokens/{apiToken}'
*/
export const destroy = (args: { team: number | { id: number }, apiToken: number | { id: number } } | [team: number | { id: number }, apiToken: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/teams/{team}/api-tokens/{apiToken}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::destroy
* @see app/Http/Controllers/Settings/ApiTokenController.php:40
* @route '/app/settings/teams/{team}/api-tokens/{apiToken}'
*/
destroy.url = (args: { team: number | { id: number }, apiToken: number | { id: number } } | [team: number | { id: number }, apiToken: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            apiToken: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
        apiToken: typeof args.apiToken === 'object'
        ? args.apiToken.id
        : args.apiToken,
    }

    return destroy.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{apiToken}', parsedArgs.apiToken.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::destroy
* @see app/Http/Controllers/Settings/ApiTokenController.php:40
* @route '/app/settings/teams/{team}/api-tokens/{apiToken}'
*/
destroy.delete = (args: { team: number | { id: number }, apiToken: number | { id: number } } | [team: number | { id: number }, apiToken: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::destroy
* @see app/Http/Controllers/Settings/ApiTokenController.php:40
* @route '/app/settings/teams/{team}/api-tokens/{apiToken}'
*/
const destroyForm = (args: { team: number | { id: number }, apiToken: number | { id: number } } | [team: number | { id: number }, apiToken: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\ApiTokenController::destroy
* @see app/Http/Controllers/Settings/ApiTokenController.php:40
* @route '/app/settings/teams/{team}/api-tokens/{apiToken}'
*/
destroyForm.delete = (args: { team: number | { id: number }, apiToken: number | { id: number } } | [team: number | { id: number }, apiToken: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ApiTokenController = { store, destroy }

export default ApiTokenController