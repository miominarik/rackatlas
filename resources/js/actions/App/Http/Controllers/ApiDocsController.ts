import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ApiDocsController::__invoke
* @see app/Http/Controllers/ApiDocsController.php:16
* @route '/api-docs'
*/
const ApiDocsController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ApiDocsController.url(options),
    method: 'get',
})

ApiDocsController.definition = {
    methods: ["get","head"],
    url: '/api-docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApiDocsController::__invoke
* @see app/Http/Controllers/ApiDocsController.php:16
* @route '/api-docs'
*/
ApiDocsController.url = (options?: RouteQueryOptions) => {
    return ApiDocsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApiDocsController::__invoke
* @see app/Http/Controllers/ApiDocsController.php:16
* @route '/api-docs'
*/
ApiDocsController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ApiDocsController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApiDocsController::__invoke
* @see app/Http/Controllers/ApiDocsController.php:16
* @route '/api-docs'
*/
ApiDocsController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ApiDocsController.url(options),
    method: 'head',
})

export default ApiDocsController