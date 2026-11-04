import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:64
* @route '/app/settings/devices/{device}/login-approval'
*/
export const update = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/app/settings/devices/{device}/login-approval',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:64
* @route '/app/settings/devices/{device}/login-approval'
*/
update.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { device: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            device: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        device: typeof args.device === 'object'
        ? args.device.id
        : args.device,
    }

    return update.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:64
* @route '/app/settings/devices/{device}/login-approval'
*/
update.patch = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:64
* @route '/app/settings/devices/{device}/login-approval'
*/
const updateForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:64
* @route '/app/settings/devices/{device}/login-approval'
*/
updateForm.patch = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const loginApproval = {
    update: Object.assign(update, update),
}

export default loginApproval