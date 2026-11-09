import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
const PrivacyControllera2c058616aeb0c9393ca03a98bc05c02 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.definition = {
    methods: ["get","head"],
    url: '/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url = (options?: RouteQueryOptions) => {
    return PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
const PrivacyControllera2c058616aeb0c9393ca03a98bc05c02Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
PrivacyControllera2c058616aeb0c9393ca03a98bc05c02Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/privacy'
*/
PrivacyControllera2c058616aeb0c9393ca03a98bc05c02Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

PrivacyControllera2c058616aeb0c9393ca03a98bc05c02.form = PrivacyControllera2c058616aeb0c9393ca03a98bc05c02Form
/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
const PrivacyControllercaf646eba47d7fcec2a49f7a942be10a = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, options),
    method: 'get',
})

PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.definition = {
    methods: ["get","head"],
    url: '/{locale}/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.definition.url
            .replace('{locale}', parsedArgs.locale.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.get = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.head = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
const PrivacyControllercaf646eba47d7fcec2a49f7a942be10aForm = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
PrivacyControllercaf646eba47d7fcec2a49f7a942be10aForm.get = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PrivacyController::__invoke
* @see app/Http/Controllers/PrivacyController.php:14
* @route '/{locale}/privacy'
*/
PrivacyControllercaf646eba47d7fcec2a49f7a942be10aForm.head = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

PrivacyControllercaf646eba47d7fcec2a49f7a942be10a.form = PrivacyControllercaf646eba47d7fcec2a49f7a942be10aForm

/**
* Multiple routes resolve to \App\Http\Controllers\PrivacyController::PrivacyController, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `PrivacyController['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
const PrivacyController = {
    '/privacy': PrivacyControllera2c058616aeb0c9393ca03a98bc05c02,
    '/{locale}/privacy': PrivacyControllercaf646eba47d7fcec2a49f7a942be10a,
}

export default PrivacyController