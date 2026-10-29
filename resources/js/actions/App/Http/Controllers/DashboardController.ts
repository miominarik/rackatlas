import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::show
* @see app/Http/Controllers/DashboardController.php:32
* @route '/app'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:66
* @route '/app/dashboard/settings'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/dashboard/settings',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:66
* @route '/app/dashboard/settings'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:66
* @route '/app/dashboard/settings'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:66
* @route '/app/dashboard/settings'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:66
* @route '/app/dashboard/settings'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:78
* @route '/app/dashboard/settings'
*/
export const reset = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reset.url(options),
    method: 'delete',
})

reset.definition = {
    methods: ["delete"],
    url: '/app/dashboard/settings',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:78
* @route '/app/dashboard/settings'
*/
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:78
* @route '/app/dashboard/settings'
*/
reset.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reset.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:78
* @route '/app/dashboard/settings'
*/
const resetForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:78
* @route '/app/dashboard/settings'
*/
resetForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reset.form = resetForm

/**
* @see \App\Http\Controllers\DashboardController::copy
* @see app/Http/Controllers/DashboardController.php:90
* @route '/app/dashboard/settings/copy'
*/
export const copy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copy.url(options),
    method: 'post',
})

copy.definition = {
    methods: ["post"],
    url: '/app/dashboard/settings/copy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::copy
* @see app/Http/Controllers/DashboardController.php:90
* @route '/app/dashboard/settings/copy'
*/
copy.url = (options?: RouteQueryOptions) => {
    return copy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::copy
* @see app/Http/Controllers/DashboardController.php:90
* @route '/app/dashboard/settings/copy'
*/
copy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::copy
* @see app/Http/Controllers/DashboardController.php:90
* @route '/app/dashboard/settings/copy'
*/
const copyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: copy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::copy
* @see app/Http/Controllers/DashboardController.php:90
* @route '/app/dashboard/settings/copy'
*/
copyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: copy.url(options),
    method: 'post',
})

copy.form = copyForm

const DashboardController = { show, update, reset, copy }

export default DashboardController