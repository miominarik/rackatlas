import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
const RedisSwitchoverController = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedisSwitchoverController.url(args, options),
    method: 'post',
})

RedisSwitchoverController.definition = {
    methods: ["post"],
    url: '/app/redis/groups/{group}/switchover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
RedisSwitchoverController.url = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return RedisSwitchoverController.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
RedisSwitchoverController.post = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedisSwitchoverController.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
const RedisSwitchoverControllerForm = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedisSwitchoverController.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RedisSwitchoverController::__invoke
* @see app/Http/Controllers/RedisSwitchoverController.php:17
* @route '/app/redis/groups/{group}/switchover'
*/
RedisSwitchoverControllerForm.post = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedisSwitchoverController.url(args, options),
    method: 'post',
})

RedisSwitchoverController.form = RedisSwitchoverControllerForm

export default RedisSwitchoverController