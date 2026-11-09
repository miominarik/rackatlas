import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DatabaseProcessController::index
* @see app/Http/Controllers/DatabaseProcessController.php:15
* @route '/app/databases/{server}/processes'
*/
export const index = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/databases/{server}/processes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DatabaseProcessController::index
* @see app/Http/Controllers/DatabaseProcessController.php:15
* @route '/app/databases/{server}/processes'
*/
index.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DatabaseProcessController::index
* @see app/Http/Controllers/DatabaseProcessController.php:15
* @route '/app/databases/{server}/processes'
*/
index.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DatabaseProcessController::index
* @see app/Http/Controllers/DatabaseProcessController.php:15
* @route '/app/databases/{server}/processes'
*/
index.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DatabaseProcessController::kill
* @see app/Http/Controllers/DatabaseProcessController.php:30
* @route '/app/databases/{server}/processes/{process}/kill'
*/
export const kill = (args: { server: number | { id: number }, process: string | number } | [server: number | { id: number }, process: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: kill.url(args, options),
    method: 'post',
})

kill.definition = {
    methods: ["post"],
    url: '/app/databases/{server}/processes/{process}/kill',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DatabaseProcessController::kill
* @see app/Http/Controllers/DatabaseProcessController.php:30
* @route '/app/databases/{server}/processes/{process}/kill'
*/
kill.url = (args: { server: number | { id: number }, process: string | number } | [server: number | { id: number }, process: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            server: args[0],
            process: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
        process: args.process,
    }

    return kill.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace('{process}', parsedArgs.process.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DatabaseProcessController::kill
* @see app/Http/Controllers/DatabaseProcessController.php:30
* @route '/app/databases/{server}/processes/{process}/kill'
*/
kill.post = (args: { server: number | { id: number }, process: string | number } | [server: number | { id: number }, process: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: kill.url(args, options),
    method: 'post',
})

const DatabaseProcessController = { index, kill }

export default DatabaseProcessController