import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\LogController::index
* @see app/Http/Controllers/Servers/LogController.php:20
* @route '/app/logs'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
export const resolveAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAll.url(options),
    method: 'post',
})

resolveAll.definition = {
    methods: ["post"],
    url: '/app/logs/resolve-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
resolveAll.url = (options?: RouteQueryOptions) => {
    return resolveAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
resolveAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
const resolveAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolveAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolveAll
* @see app/Http/Controllers/Servers/LogController.php:102
* @route '/app/logs/resolve-all'
*/
resolveAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolveAll.url(options),
    method: 'post',
})

resolveAll.form = resolveAllForm

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
export const resolve = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/app/logs/{log}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
resolve.url = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { log: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { log: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            log: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        log: typeof args.log === 'object'
        ? args.log.id
        : args.log,
    }

    return resolve.definition.url
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
resolve.post = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
const resolveForm = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::resolve
* @see app/Http/Controllers/Servers/LogController.php:81
* @route '/app/logs/{log}/resolve'
*/
resolveForm.post = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolve.url(args, options),
    method: 'post',
})

resolve.form = resolveForm

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
export const reopen = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reopen.url(args, options),
    method: 'delete',
})

reopen.definition = {
    methods: ["delete"],
    url: '/app/logs/{log}/resolve',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
reopen.url = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { log: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { log: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            log: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        log: typeof args.log === 'object'
        ? args.log.id
        : args.log,
    }

    return reopen.definition.url
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
reopen.delete = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reopen.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
const reopenForm = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reopen.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\LogController::reopen
* @see app/Http/Controllers/Servers/LogController.php:90
* @route '/app/logs/{log}/resolve'
*/
reopenForm.delete = (args: { log: number | { id: number } } | [log: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reopen.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reopen.form = reopenForm

const LogController = { index, resolveAll, resolve, reopen }

export default LogController