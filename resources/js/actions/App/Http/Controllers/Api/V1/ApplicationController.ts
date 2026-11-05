import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/applications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\ApplicationController::index
* @see app/Http/Controllers/Api/V1/ApplicationController.php:16
* @route '/api/v1/applications'
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

const ApplicationController = { index }

export default ApplicationController