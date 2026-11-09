import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ServerMetricController::disks
* @see app/Http/Controllers/Api/V1/ServerMetricController.php:24
* @route '/api/v1/servers/{server}/metrics/disks'
*/
export const disks = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disks.url(args, options),
    method: 'get',
})

disks.definition = {
    methods: ["get","head"],
    url: '/api/v1/servers/{server}/metrics/disks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ServerMetricController::disks
* @see app/Http/Controllers/Api/V1/ServerMetricController.php:24
* @route '/api/v1/servers/{server}/metrics/disks'
*/
disks.url = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return disks.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ServerMetricController::disks
* @see app/Http/Controllers/Api/V1/ServerMetricController.php:24
* @route '/api/v1/servers/{server}/metrics/disks'
*/
disks.get = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disks.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ServerMetricController::disks
* @see app/Http/Controllers/Api/V1/ServerMetricController.php:24
* @route '/api/v1/servers/{server}/metrics/disks'
*/
disks.head = (args: { server: string | number } | [server: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disks.url(args, options),
    method: 'head',
})

const metrics = {
    disks: Object.assign(disks, disks),
}

export default metrics