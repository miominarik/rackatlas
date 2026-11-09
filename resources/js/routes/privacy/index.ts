import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
export const localized = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: localized.url(args, options),
    method: 'get',
})

localized.definition = {
    methods: ["get","head"],
    url: '/{locale}/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
localized.url = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { locale: args }
    }

    if (Array.isArray(args)) {
        args = {
            locale: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        locale: args.locale,
    }

    return localized.definition.url
            .replace('{locale}', parsedArgs.locale.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
localized.get = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: localized.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
localized.head = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: localized.url(args, options),
    method: 'head',
})

const privacy = {
    localized: Object.assign(localized, localized),
}

export default privacy