import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
const MetricsProcessesControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MetricsProcessesController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
MetricsProcessesControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MetricsProcessesController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
MetricsProcessesControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MetricsProcessesController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

MetricsProcessesController.form = MetricsProcessesControllerForm

export default MetricsProcessesController