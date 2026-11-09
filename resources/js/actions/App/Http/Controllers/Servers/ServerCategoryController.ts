import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::store
* @see app/Http/Controllers/Servers/ServerCategoryController.php:13
* @route '/app/server-categories'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/server-categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::store
* @see app/Http/Controllers/Servers/ServerCategoryController.php:13
* @route '/app/server-categories'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::store
* @see app/Http/Controllers/Servers/ServerCategoryController.php:13
* @route '/app/server-categories'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::store
* @see app/Http/Controllers/Servers/ServerCategoryController.php:13
* @route '/app/server-categories'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::store
* @see app/Http/Controllers/Servers/ServerCategoryController.php:13
* @route '/app/server-categories'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::update
* @see app/Http/Controllers/Servers/ServerCategoryController.php:22
* @route '/app/server-categories/{serverCategory}'
*/
export const update = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/app/server-categories/{serverCategory}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::update
* @see app/Http/Controllers/Servers/ServerCategoryController.php:22
* @route '/app/server-categories/{serverCategory}'
*/
update.url = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { serverCategory: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { serverCategory: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            serverCategory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        serverCategory: typeof args.serverCategory === 'object'
        ? args.serverCategory.id
        : args.serverCategory,
    }

    return update.definition.url
            .replace('{serverCategory}', parsedArgs.serverCategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::update
* @see app/Http/Controllers/Servers/ServerCategoryController.php:22
* @route '/app/server-categories/{serverCategory}'
*/
update.patch = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::update
* @see app/Http/Controllers/Servers/ServerCategoryController.php:22
* @route '/app/server-categories/{serverCategory}'
*/
const updateForm = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::update
* @see app/Http/Controllers/Servers/ServerCategoryController.php:22
* @route '/app/server-categories/{serverCategory}'
*/
updateForm.patch = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::destroy
* @see app/Http/Controllers/Servers/ServerCategoryController.php:31
* @route '/app/server-categories/{serverCategory}'
*/
export const destroy = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/server-categories/{serverCategory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::destroy
* @see app/Http/Controllers/Servers/ServerCategoryController.php:31
* @route '/app/server-categories/{serverCategory}'
*/
destroy.url = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { serverCategory: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { serverCategory: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            serverCategory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        serverCategory: typeof args.serverCategory === 'object'
        ? args.serverCategory.id
        : args.serverCategory,
    }

    return destroy.definition.url
            .replace('{serverCategory}', parsedArgs.serverCategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::destroy
* @see app/Http/Controllers/Servers/ServerCategoryController.php:31
* @route '/app/server-categories/{serverCategory}'
*/
destroy.delete = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::destroy
* @see app/Http/Controllers/Servers/ServerCategoryController.php:31
* @route '/app/server-categories/{serverCategory}'
*/
const destroyForm = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerCategoryController::destroy
* @see app/Http/Controllers/Servers/ServerCategoryController.php:31
* @route '/app/server-categories/{serverCategory}'
*/
destroyForm.delete = (args: { serverCategory: number | { id: number } } | [serverCategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ServerCategoryController = { store, update, destroy }

export default ServerCategoryController