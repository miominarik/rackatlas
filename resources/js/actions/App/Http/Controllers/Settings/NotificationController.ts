import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/app/settings/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::edit
* @see app/Http/Controllers/Settings/NotificationController.php:18
* @route '/app/settings/notifications'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\NotificationController::update
* @see app/Http/Controllers/Settings/NotificationController.php:39
* @route '/app/settings/notifications'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/settings/notifications',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\NotificationController::update
* @see app/Http/Controllers/Settings/NotificationController.php:39
* @route '/app/settings/notifications'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationController::update
* @see app/Http/Controllers/Settings/NotificationController.php:39
* @route '/app/settings/notifications'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::update
* @see app/Http/Controllers/Settings/NotificationController.php:39
* @route '/app/settings/notifications'
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
* @see \App\Http\Controllers\Settings\NotificationController::update
* @see app/Http/Controllers/Settings/NotificationController.php:39
* @route '/app/settings/notifications'
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
* @see \App\Http\Controllers\Settings\NotificationController::test
* @see app/Http/Controllers/Settings/NotificationController.php:60
* @route '/app/settings/notifications/test'
*/
export const test = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/app/settings/notifications/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\NotificationController::test
* @see app/Http/Controllers/Settings/NotificationController.php:60
* @route '/app/settings/notifications/test'
*/
test.url = (options?: RouteQueryOptions) => {
    return test.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\NotificationController::test
* @see app/Http/Controllers/Settings/NotificationController.php:60
* @route '/app/settings/notifications/test'
*/
test.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::test
* @see app/Http/Controllers/Settings/NotificationController.php:60
* @route '/app/settings/notifications/test'
*/
const testForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\NotificationController::test
* @see app/Http/Controllers/Settings/NotificationController.php:60
* @route '/app/settings/notifications/test'
*/
testForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(options),
    method: 'post',
})

test.form = testForm

const NotificationController = { edit, update, test }

export default NotificationController