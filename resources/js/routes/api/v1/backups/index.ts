import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/backups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\BackupController::index
* @see app/Http/Controllers/Api/V1/BackupController.php:14
* @route '/api/v1/backups'
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

const backups = {
    index: Object.assign(index, index),
}

export default backups