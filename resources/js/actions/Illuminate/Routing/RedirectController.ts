import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
const RedirectController93c099bba3220290ae1ba15735dc10ba = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'get',
})

RedirectController93c099bba3220290ae1ba15735dc10ba.definition = {
    methods: ["get","head","post","put","patch","delete","options","query"],
    url: '/app/admin',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","query"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.url = (options?: RouteQueryOptions) => {
    return RedirectController93c099bba3220290ae1ba15735dc10ba.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10ba.query = (options?: RouteQueryOptions): RouteDefinition<'query'> => ({
    url: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'query',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
const RedirectController93c099bba3220290ae1ba15735dc10baForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/admin'
*/
RedirectController93c099bba3220290ae1ba15735dc10baForm.query = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController93c099bba3220290ae1ba15735dc10ba.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'QUERY',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

RedirectController93c099bba3220290ae1ba15735dc10ba.form = RedirectController93c099bba3220290ae1ba15735dc10baForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
const RedirectController13cb65bbaba708edb4663c26919ecb7b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'get',
})

RedirectController13cb65bbaba708edb4663c26919ecb7b.definition = {
    methods: ["get","head","post","put","patch","delete","options","query"],
    url: '/app/settings',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","query"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.url = (options?: RouteQueryOptions) => {
    return RedirectController13cb65bbaba708edb4663c26919ecb7b.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7b.query = (options?: RouteQueryOptions): RouteDefinition<'query'> => ({
    url: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'query',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
const RedirectController13cb65bbaba708edb4663c26919ecb7bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings'
*/
RedirectController13cb65bbaba708edb4663c26919ecb7bForm.query = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController13cb65bbaba708edb4663c26919ecb7b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'QUERY',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

RedirectController13cb65bbaba708edb4663c26919ecb7b.form = RedirectController13cb65bbaba708edb4663c26919ecb7bForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
const RedirectController331d1b327d2677914555bf8a378e4c84 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'get',
})

RedirectController331d1b327d2677914555bf8a378e4c84.definition = {
    methods: ["get","head","post","put","patch","delete","options","query"],
    url: '/app/settings/language',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","query"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.url = (options?: RouteQueryOptions) => {
    return RedirectController331d1b327d2677914555bf8a378e4c84.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84.query = (options?: RouteQueryOptions): RouteDefinition<'query'> => ({
    url: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'query',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
const RedirectController331d1b327d2677914555bf8a378e4c84Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/language'
*/
RedirectController331d1b327d2677914555bf8a378e4c84Form.query = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController331d1b327d2677914555bf8a378e4c84.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'QUERY',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

RedirectController331d1b327d2677914555bf8a378e4c84.form = RedirectController331d1b327d2677914555bf8a378e4c84Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
const RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'get',
})

RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.definition = {
    methods: ["get","head","post","put","patch","delete","options","query"],
    url: '/app/settings/appearance',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","query"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url = (options?: RouteQueryOptions) => {
    return RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.query = (options?: RouteQueryOptions): RouteDefinition<'query'> => ({
    url: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'query',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
const RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/app/settings/appearance'
*/
RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form.query = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'QUERY',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16.form = RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16Form

/**
* Multiple routes resolve to \Illuminate\Routing\RedirectController::RedirectController, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `RedirectController['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
const RedirectController = {
    '/app/admin': RedirectController93c099bba3220290ae1ba15735dc10ba,
    '/app/settings': RedirectController13cb65bbaba708edb4663c26919ecb7b,
    '/app/settings/language': RedirectController331d1b327d2677914555bf8a378e4c84,
    '/app/settings/appearance': RedirectController704700ed612f6c7ff2a9e4f7a1d2fd16,
}

export default RedirectController