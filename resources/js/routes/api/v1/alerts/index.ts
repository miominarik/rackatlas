import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\AlertController::index
* @see app/Http/Controllers/Api/V1/AlertController.php:19
* @route '/api/v1/alerts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AlertController::index
* @see app/Http/Controllers/Api/V1/AlertController.php:19
* @route '/api/v1/alerts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AlertController::index
* @see app/Http/Controllers/Api/V1/AlertController.php:19
* @route '/api/v1/alerts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AlertController::index
* @see app/Http/Controllers/Api/V1/AlertController.php:19
* @route '/api/v1/alerts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const alerts = {
    index: Object.assign(index, index),
}

export default alerts