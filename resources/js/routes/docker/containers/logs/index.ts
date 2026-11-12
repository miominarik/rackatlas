import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DockerController::request
* @see app/Http/Controllers/DockerController.php:102
* @route '/app/docker/containers/{container}/logs'
*/
export const request = (args: { container: string | number | { id: string | number } } | [container: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

request.definition = {
    methods: ["post"],
    url: '/app/docker/containers/{container}/logs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DockerController::request
* @see app/Http/Controllers/DockerController.php:102
* @route '/app/docker/containers/{container}/logs'
*/
request.url = (args: { container: string | number | { id: string | number } } | [container: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { container: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { container: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            container: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        container: typeof args.container === 'object'
        ? args.container.id
        : args.container,
    }

    return request.definition.url
            .replace('{container}', parsedArgs.container.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DockerController::request
* @see app/Http/Controllers/DockerController.php:102
* @route '/app/docker/containers/{container}/logs'
*/
request.post = (args: { container: string | number | { id: string | number } } | [container: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DockerController::request
* @see app/Http/Controllers/DockerController.php:102
* @route '/app/docker/containers/{container}/logs'
*/
const requestForm = (args: { container: string | number | { id: string | number } } | [container: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DockerController::request
* @see app/Http/Controllers/DockerController.php:102
* @route '/app/docker/containers/{container}/logs'
*/
requestForm.post = (args: { container: string | number | { id: string | number } } | [container: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(args, options),
    method: 'post',
})

request.form = requestForm
