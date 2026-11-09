import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
export const resolveAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAll.url(options),
    method: 'post',
})

resolveAll.definition = {
    methods: ["post"],
    url: '/app/logs/resolve-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
resolveAll.url = (options?: RouteQueryOptions) => {
    return resolveAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
resolveAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
export const resolve = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/app/logs/{log}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
resolve.url = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { log: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { log: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            log: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        log: typeof args.log === 'object'
        ? args.log.id
        : args.log,
    }

    return resolve.definition.url
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
resolve.post = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
export const reopen = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reopen.url(args, options),
    method: 'delete',
})

reopen.definition = {
    methods: ["delete"],
    url: '/app/logs/{log}/resolve',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
reopen.url = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { log: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { log: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            log: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        log: typeof args.log === 'object'
        ? args.log.id
        : args.log,
    }

    return reopen.definition.url
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
reopen.delete = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reopen.url(args, options),
    method: 'delete',
})

const LogController = { index, resolveAll, resolve, reopen }

export default LogController