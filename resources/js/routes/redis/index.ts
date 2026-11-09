import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/redis',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
export const switchover = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchover.url(args, options),
    method: 'post',
})

switchover.definition = {
    methods: ["post"],
    url: '/app/redis/groups/{group}/switchover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
switchover.url = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { group: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.id
        : args.group,
    }

    return switchover.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
switchover.post = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchover.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
const switchoverForm = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchover.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
switchoverForm.post = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchover.url(args, options),
    method: 'post',
})

switchover.form = switchoverForm

const redis = {
    index: Object.assign(index, index),
    switchover: Object.assign(switchover, switchover),
}

export default redis