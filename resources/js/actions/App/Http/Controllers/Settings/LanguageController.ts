import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:18
* @route '/language'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/language',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:18
* @route '/language'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:18
* @route '/language'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\LanguageController::update
* @see app/Http/Controllers/Settings/LanguageController.php:18
* @route '/language'
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
* @see app/Http/Controllers/Settings/LanguageController.php:18
* @route '/language'
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

const LanguageController = { update }

export default LanguageController