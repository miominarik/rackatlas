import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\FcmTokenController::store
* @see app/Http/Controllers/Settings/FcmTokenController.php:20
* @route '/app/settings/notifications/fcm'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/settings/notifications/fcm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\FcmTokenController::store
* @see app/Http/Controllers/Settings/FcmTokenController.php:20
* @route '/app/settings/notifications/fcm'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\FcmTokenController::store
* @see app/Http/Controllers/Settings/FcmTokenController.php:20
* @route '/app/settings/notifications/fcm'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\FcmTokenController::store
* @see app/Http/Controllers/Settings/FcmTokenController.php:20
* @route '/app/settings/notifications/fcm'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\FcmTokenController::store
* @see app/Http/Controllers/Settings/FcmTokenController.php:20
* @route '/app/settings/notifications/fcm'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const fcmTokens = {
    store: Object.assign(store, store),
}

export default fcmTokens