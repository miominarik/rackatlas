import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import containers from './containers'
/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/docker',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DockerController::index
* @see app/Http/Controllers/DockerController.php:21
* @route '/app/docker'
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

const docker = {
    index: Object.assign(index, index),
    containers: Object.assign(containers, containers),
}

export default docker