import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import processes from './processes'
/**
* @see \App\Http\Controllers\DatabaseController::index
* @see app/Http/Controllers/DatabaseController.php:23
* @route '/app/databases'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/databases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DatabaseController::index
* @see app/Http/Controllers/DatabaseController.php:23
* @route '/app/databases'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DatabaseController::index
* @see app/Http/Controllers/DatabaseController.php:23
* @route '/app/databases'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DatabaseController::index
* @see app/Http/Controllers/DatabaseController.php:23
* @route '/app/databases'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DatabaseController::show
* @see app/Http/Controllers/DatabaseController.php:53
* @route '/app/databases/{server}'
*/
export const show = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/databases/{server}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DatabaseController::show
* @see app/Http/Controllers/DatabaseController.php:53
* @route '/app/databases/{server}'
*/
show.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { server: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
    }

    return show.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DatabaseController::show
* @see app/Http/Controllers/DatabaseController.php:53
* @route '/app/databases/{server}'
*/
show.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DatabaseController::show
* @see app/Http/Controllers/DatabaseController.php:53
* @route '/app/databases/{server}'
*/
show.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const databases = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    processes: Object.assign(processes, processes),
}

export default databases