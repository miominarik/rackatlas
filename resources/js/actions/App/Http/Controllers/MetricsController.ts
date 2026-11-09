import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:18
* @route '/app/metrics'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:18
* @route '/app/metrics'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:18
* @route '/app/metrics'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:18
* @route '/app/metrics'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const MetricsController = { index }

export default MetricsController