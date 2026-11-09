import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:22
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
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:22
* @route '/app/settings/notifications/push'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:22
* @route '/app/settings/notifications/push'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:58
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
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:58
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
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:58
* @route '/app/settings/notifications/push/{subscription}'
*/
destroy.delete = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const pushSubscriptions = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default pushSubscriptions