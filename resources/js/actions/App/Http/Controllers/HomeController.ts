import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/'
*/
const HomeController980bb49ee7ae63891f1d891d2fbcf1c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomeController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

HomeController980bb49ee7ae63891f1d891d2fbcf1c9.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/'
*/
HomeController980bb49ee7ae63891f1d891d2fbcf1c9.url = (options?: RouteQueryOptions) => {
    return HomeController980bb49ee7ae63891f1d891d2fbcf1c9.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/'
*/
HomeController980bb49ee7ae63891f1d891d2fbcf1c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomeController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/'
*/
HomeController980bb49ee7ae63891f1d891d2fbcf1c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: HomeController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/{locale}'
*/
const HomeControllerbf65595efa5b2f0b55f31d01179be727 = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomeControllerbf65595efa5b2f0b55f31d01179be727.url(args, options),
    method: 'get',
})

HomeControllerbf65595efa5b2f0b55f31d01179be727.definition = {
    methods: ["get","head"],
    url: '/{locale}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/{locale}'
*/
HomeControllerbf65595efa5b2f0b55f31d01179be727.url = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return HomeControllerbf65595efa5b2f0b55f31d01179be727.definition.url
            .replace('{locale}', parsedArgs.locale.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/{locale}'
*/
HomeControllerbf65595efa5b2f0b55f31d01179be727.get = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomeControllerbf65595efa5b2f0b55f31d01179be727.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\HomeController::__invoke
* @see app/Http/Controllers/HomeController.php:16
* @route '/{locale}'
*/
HomeControllerbf65595efa5b2f0b55f31d01179be727.head = (args: { locale: string | number } | [locale: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: HomeControllerbf65595efa5b2f0b55f31d01179be727.url(args, options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\HomeController::HomeController, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `HomeController['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
const HomeController = {
    '/': HomeController980bb49ee7ae63891f1d891d2fbcf1c9,
    '/{locale}': HomeControllerbf65595efa5b2f0b55f31d01179be727,
}

export default HomeController