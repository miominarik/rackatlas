import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ServerController::index
* @see app/Http/Controllers/Api/V1/ServerController.php:14
* @route '/api/v1/servers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/servers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ServerController::index
* @see app/Http/Controllers/Api/V1/ServerController.php:14
* @route '/api/v1/servers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ServerController::index
* @see app/Http/Controllers/Api/V1/ServerController.php:14
* @route '/api/v1/servers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ServerController::index
* @see app/Http/Controllers/Api/V1/ServerController.php:14
* @route '/api/v1/servers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\ServerController::show
* @see app/Http/Controllers/Api/V1/ServerController.php:24
* @route '/api/v1/servers/{server}'
*/
export const show = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/servers/{server}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ServerController::show
* @see app/Http/Controllers/Api/V1/ServerController.php:24
* @route '/api/v1/servers/{server}'
*/
show.url = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: args.server,
    }

    return show.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ServerController::show
* @see app/Http/Controllers/Api/V1/ServerController.php:24
* @route '/api/v1/servers/{server}'
*/
show.get = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ServerController::show
* @see app/Http/Controllers/Api/V1/ServerController.php:24
* @route '/api/v1/servers/{server}'
*/
show.head = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const ServerController = { index, show }

export default ServerController