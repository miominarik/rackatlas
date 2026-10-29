import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:18
* @route '/app/logs'
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

const LogController = { index }

export default LogController