import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/app/settings/language',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::edit
* @see app/Http/Controllers/Settings/LanguageController.php:19
* @route '/app/settings/language'
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
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:27
* @route '/app/settings/language'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/settings/language',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:27
* @route '/app/settings/language'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:27
* @route '/app/settings/language'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:27
* @route '/app/settings/language'
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
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:27
* @route '/app/settings/language'
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

const LanguageController = { edit, update }

export default LanguageController