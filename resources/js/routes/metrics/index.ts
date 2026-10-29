import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
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
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsController::index
* @see app/Http/Controllers/MetricsController.php:17
* @route '/app/metrics'
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

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
const processesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: processes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
processesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: processes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MetricsProcessesController::__invoke
* @see app/Http/Controllers/MetricsProcessesController.php:17
* @route '/app/metrics/processes'
*/
processesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: processes.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

processes.form = processesForm

const metrics = {
    index: Object.assign(index, index),
    processes: Object.assign(processes, processes),
}

export default metrics