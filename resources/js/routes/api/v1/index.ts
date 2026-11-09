import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import servers from './servers'
import applications from './applications'
import backups from './backups'
import alerts from './alerts'
/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/v1/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

const v1 = {
    me: Object.assign(me, me),
    servers: Object.assign(servers, servers),
    applications: Object.assign(applications, applications),
    backups: Object.assign(backups, backups),
    alerts: Object.assign(alerts, alerts),
}

export default v1