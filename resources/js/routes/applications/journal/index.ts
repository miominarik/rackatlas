import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ApplicationController::request
* @see app/Http/Controllers/ApplicationController.php:65
* @route '/app/applications/{service}/journal'
*/
export const request = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

request.definition = {
    methods: ["post"],
    url: '/app/applications/{service}/journal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApplicationController::request
* @see app/Http/Controllers/ApplicationController.php:65
* @route '/app/applications/{service}/journal'
*/
request.url = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { service: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { service: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            service: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        service: typeof args.service === 'object'
        ? args.service.id
        : args.service,
    }

    return request.definition.url
            .replace('{service}', parsedArgs.service.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::request
* @see app/Http/Controllers/ApplicationController.php:65
* @route '/app/applications/{service}/journal'
*/
request.post = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApplicationController::request
* @see app/Http/Controllers/ApplicationController.php:65
* @route '/app/applications/{service}/journal'
*/
const requestForm = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApplicationController::request
* @see app/Http/Controllers/ApplicationController.php:65
* @route '/app/applications/{service}/journal'
*/
requestForm.post = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(args, options),
    method: 'post',
})

request.form = requestForm

const journal = {
    request: Object.assign(request, request),
}

export default journal