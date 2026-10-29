import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/settings/notifications/diagnostics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::show
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:15
* @route '/app/settings/notifications/diagnostics'
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
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::connectivity
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:23
* @route '/app/settings/notifications/diagnostics/connectivity'
*/
export const connectivity = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connectivity.url(options),
    method: 'post',
})

connectivity.definition = {
    methods: ["post"],
    url: '/app/settings/notifications/diagnostics/connectivity',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::connectivity
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:23
* @route '/app/settings/notifications/diagnostics/connectivity'
*/
connectivity.url = (options?: RouteQueryOptions) => {
    return connectivity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::connectivity
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:23
* @route '/app/settings/notifications/diagnostics/connectivity'
*/
connectivity.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connectivity.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::connectivity
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:23
* @route '/app/settings/notifications/diagnostics/connectivity'
*/
const connectivityForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connectivity.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::connectivity
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:23
* @route '/app/settings/notifications/diagnostics/connectivity'
*/
connectivityForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connectivity.url(options),
    method: 'post',
})

connectivity.form = connectivityForm

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::push
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:31
* @route '/app/settings/notifications/diagnostics/push'
*/
export const push = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

push.definition = {
    methods: ["post"],
    url: '/app/settings/notifications/diagnostics/push',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::push
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:31
* @route '/app/settings/notifications/diagnostics/push'
*/
push.url = (options?: RouteQueryOptions) => {
    return push.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::push
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:31
* @route '/app/settings/notifications/diagnostics/push'
*/
push.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::push
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:31
* @route '/app/settings/notifications/diagnostics/push'
*/
const pushForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationDiagnosticsController::push
* @see app/Http/Controllers/Settings/NotificationDiagnosticsController.php:31
* @route '/app/settings/notifications/diagnostics/push'
*/
pushForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

push.form = pushForm

const NotificationDiagnosticsController = { show, connectivity, push }

export default NotificationDiagnosticsController