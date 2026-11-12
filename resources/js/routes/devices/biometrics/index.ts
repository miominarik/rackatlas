import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:62
* @route '/app/settings/devices/current/biometrics'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/settings/devices/current/biometrics',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:62
* @route '/app/settings/devices/current/biometrics'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:62
* @route '/app/settings/devices/current/biometrics'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:62
* @route '/app/settings/devices/current/biometrics'
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
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:62
* @route '/app/settings/devices/current/biometrics'
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

const biometrics = {
    update: Object.assign(update, update),
}

export default biometrics