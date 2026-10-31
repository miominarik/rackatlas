import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/settings/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::index
* @see app/Http/Controllers/Settings/DeviceController.php:20
* @route '/app/settings/devices'
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
* @see \App\Http\Controllers\Settings\DeviceController::destroyOthers
* @see app/Http/Controllers/Settings/DeviceController.php:78
* @route '/app/settings/devices/sign-out-others'
*/
export const destroyOthers = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyOthers.url(options),
    method: 'post',
})

destroyOthers.definition = {
    methods: ["post"],
    url: '/app/settings/devices/sign-out-others',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroyOthers
* @see app/Http/Controllers/Settings/DeviceController.php:78
* @route '/app/settings/devices/sign-out-others'
*/
destroyOthers.url = (options?: RouteQueryOptions) => {
    return destroyOthers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroyOthers
* @see app/Http/Controllers/Settings/DeviceController.php:78
* @route '/app/settings/devices/sign-out-others'
*/
destroyOthers.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyOthers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroyOthers
* @see app/Http/Controllers/Settings/DeviceController.php:78
* @route '/app/settings/devices/sign-out-others'
*/
const destroyOthersForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyOthers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroyOthers
* @see app/Http/Controllers/Settings/DeviceController.php:78
* @route '/app/settings/devices/sign-out-others'
*/
destroyOthersForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyOthers.url(options),
    method: 'post',
})

destroyOthers.form = destroyOthersForm

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:44
* @route '/app/settings/devices/{device}'
*/
export const update = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/app/settings/devices/{device}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:44
* @route '/app/settings/devices/{device}'
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
* @see app/Http/Controllers/Settings/DeviceController.php:44
* @route '/app/settings/devices/{device}'
*/
update.patch = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::update
* @see app/Http/Controllers/Settings/DeviceController.php:44
* @route '/app/settings/devices/{device}'
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
* @see app/Http/Controllers/Settings/DeviceController.php:44
* @route '/app/settings/devices/{device}'
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

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroy
* @see app/Http/Controllers/Settings/DeviceController.php:60
* @route '/app/settings/devices/{device}'
*/
export const destroy = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/devices/{device}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroy
* @see app/Http/Controllers/Settings/DeviceController.php:60
* @route '/app/settings/devices/{device}'
*/
destroy.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroy
* @see app/Http/Controllers/Settings/DeviceController.php:60
* @route '/app/settings/devices/{device}'
*/
destroy.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroy
* @see app/Http/Controllers/Settings/DeviceController.php:60
* @route '/app/settings/devices/{device}'
*/
const destroyForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\DeviceController::destroy
* @see app/Http/Controllers/Settings/DeviceController.php:60
* @route '/app/settings/devices/{device}'
*/
destroyForm.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const devices = {
    index: Object.assign(index, index),
    destroyOthers: Object.assign(destroyOthers, destroyOthers),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default devices