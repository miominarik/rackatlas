import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
const MetricsProcessesController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MetricsProcessesController.url(options),
    method: 'get',
})

MetricsProcessesController.definition = {
    methods: ["get","head"],
    url: '/app/metrics/processes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
MetricsProcessesController.url = (options?: RouteQueryOptions) => {
    return MetricsProcessesController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
MetricsProcessesController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MetricsProcessesController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
MetricsProcessesController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MetricsProcessesController.url(options),
    method: 'head',
})

export default MetricsProcessesController