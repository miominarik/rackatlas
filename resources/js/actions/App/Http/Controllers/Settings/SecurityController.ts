import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/app/settings/security',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:21
* @route '/app/settings/security'
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
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:59
* @route '/app/settings/password'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/settings/password',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:59
* @route '/app/settings/password'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:59
* @route '/app/settings/password'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:59
* @route '/app/settings/password'
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
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:59
* @route '/app/settings/password'
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
* @see \App\Http\Controllers\Settings\SecurityController::updatePasswordLogin
* @see app/Http/Controllers/Settings/SecurityController.php:73
* @route '/app/settings/password-login'
*/
export const updatePasswordLogin = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePasswordLogin.url(options),
    method: 'put',
})

updatePasswordLogin.definition = {
    methods: ["put"],
    url: '/app/settings/password-login',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\SecurityController::updatePasswordLogin
* @see app/Http/Controllers/Settings/SecurityController.php:73
* @route '/app/settings/password-login'
*/
updatePasswordLogin.url = (options?: RouteQueryOptions) => {
    return updatePasswordLogin.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SecurityController::updatePasswordLogin
* @see app/Http/Controllers/Settings/SecurityController.php:73
* @route '/app/settings/password-login'
*/
updatePasswordLogin.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePasswordLogin.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::updatePasswordLogin
* @see app/Http/Controllers/Settings/SecurityController.php:73
* @route '/app/settings/password-login'
*/
const updatePasswordLoginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePasswordLogin.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SecurityController::updatePasswordLogin
* @see app/Http/Controllers/Settings/SecurityController.php:73
* @route '/app/settings/password-login'
*/
updatePasswordLoginForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePasswordLogin.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updatePasswordLogin.form = updatePasswordLoginForm

const SecurityController = { edit, update, updatePasswordLogin }

export default SecurityController