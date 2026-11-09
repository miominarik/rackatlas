import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/redis',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RedisController::index
* @see app/Http/Controllers/RedisController.php:18
* @route '/app/redis'
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

const RedisController = { index }

export default RedisController