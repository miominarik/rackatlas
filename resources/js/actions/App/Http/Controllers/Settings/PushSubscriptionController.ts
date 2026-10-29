import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:19
* @route '/app/settings/notifications/push'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/settings/notifications/push',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:19
* @route '/app/settings/notifications/push'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:19
* @route '/app/settings/notifications/push'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:19
* @route '/app/settings/notifications/push'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:19
* @route '/app/settings/notifications/push'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:50
* @route '/app/settings/notifications/push/{subscription}'
*/
export const destroy = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/notifications/push/{subscription}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:50
* @route '/app/settings/notifications/push/{subscription}'
*/
destroy.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscription: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscription: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscription: typeof args.subscription === 'object'
        ? args.subscription.id
        : args.subscription,
    }

    return destroy.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:50
* @route '/app/settings/notifications/push/{subscription}'
*/
destroy.delete = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:50
* @route '/app/settings/notifications/push/{subscription}'
*/
const destroyForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:50
* @route '/app/settings/notifications/push/{subscription}'
*/
destroyForm.delete = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const PushSubscriptionController = { store, destroy }

export default PushSubscriptionController