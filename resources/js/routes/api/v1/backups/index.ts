import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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

const backups = {
    index: Object.assign(index, index),
}

export default backups