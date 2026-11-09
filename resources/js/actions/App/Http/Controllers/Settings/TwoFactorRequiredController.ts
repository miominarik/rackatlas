import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TwoFactorRequiredController::show
* @see app/Http/Controllers/Settings/TwoFactorRequiredController.php:18
* @route '/app/two-factor-required'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/two-factor-required',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorRequiredController::show
* @see app/Http/Controllers/Settings/TwoFactorRequiredController.php:18
* @route '/app/two-factor-required'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorRequiredController::show
* @see app/Http/Controllers/Settings/TwoFactorRequiredController.php:18
* @route '/app/two-factor-required'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorRequiredController::show
* @see app/Http/Controllers/Settings/TwoFactorRequiredController.php:18
* @route '/app/two-factor-required'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

const TwoFactorRequiredController = { show }

export default TwoFactorRequiredController