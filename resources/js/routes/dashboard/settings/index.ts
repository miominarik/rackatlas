import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:58
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
* @see app/Http/Controllers/DashboardController.php:58
* @route '/app/dashboard/settings'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:58
* @route '/app/dashboard/settings'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:58
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
* @see app/Http/Controllers/DashboardController.php:58
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
* @see app/Http/Controllers/DashboardController.php:75
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
* @see app/Http/Controllers/DashboardController.php:75
* @route '/app/dashboard/settings'
*/
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:75
* @route '/app/dashboard/settings'
*/
reset.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reset.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DashboardController::reset
* @see app/Http/Controllers/DashboardController.php:75
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
* @see app/Http/Controllers/DashboardController.php:75
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

const settings = {
    update: Object.assign(update, update),
    reset: Object.assign(reset, reset),
}

export default settings