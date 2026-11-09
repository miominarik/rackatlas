import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ActivityController::index
* @see app/Http/Controllers/Admin/ActivityController.php:18
* @route '/app/admin/activity'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/admin/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActivityController::index
* @see app/Http/Controllers/Admin/ActivityController.php:18
* @route '/app/admin/activity'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActivityController::index
* @see app/Http/Controllers/Admin/ActivityController.php:18
* @route '/app/admin/activity'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityController::index
* @see app/Http/Controllers/Admin/ActivityController.php:18
* @route '/app/admin/activity'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const activity = {
    index: Object.assign(index, index),
}

export default activity