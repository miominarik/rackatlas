import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
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

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
export const processes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: processes.url(options),
    method: 'get',
})

processes.definition = {
    methods: ["get","head"],
    url: '/app/metrics/processes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
processes.url = (options?: RouteQueryOptions) => {
    return processes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
processes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: processes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
processes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: processes.url(options),
    method: 'head',
})

const metrics = {
    index: Object.assign(index, index),
    processes: Object.assign(processes, processes),
}

export default metrics