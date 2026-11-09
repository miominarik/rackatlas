import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import owner from './owner'
import members from './members'
/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/admin/teams',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::index
* @see app/Http/Controllers/Admin/TeamController.php:19
* @route '/app/admin/teams'
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
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:52
* @route '/app/admin/teams'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/admin/teams',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:52
* @route '/app/admin/teams'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:52
* @route '/app/admin/teams'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:52
* @route '/app/admin/teams'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::store
* @see app/Http/Controllers/Admin/TeamController.php:52
* @route '/app/admin/teams'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
export const show = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/admin/teams/{team}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
show.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return show.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
show.get = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
show.head = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
const showForm = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
showForm.get = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::show
* @see app/Http/Controllers/Admin/TeamController.php:69
* @route '/app/admin/teams/{team}'
*/
showForm.head = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:91
* @route '/app/admin/teams/{team}'
*/
export const update = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/admin/teams/{team}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:91
* @route '/app/admin/teams/{team}'
*/
update.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return update.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:91
* @route '/app/admin/teams/{team}'
*/
update.put = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:91
* @route '/app/admin/teams/{team}'
*/
const updateForm = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::update
* @see app/Http/Controllers/Admin/TeamController.php:91
* @route '/app/admin/teams/{team}'
*/
updateForm.put = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:170
* @route '/app/admin/teams/{team}'
*/
export const destroy = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/admin/teams/{team}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:170
* @route '/app/admin/teams/{team}'
*/
destroy.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return destroy.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:170
* @route '/app/admin/teams/{team}'
*/
destroy.delete = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:170
* @route '/app/admin/teams/{team}'
*/
const destroyForm = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TeamController::destroy
* @see app/Http/Controllers/Admin/TeamController.php:170
* @route '/app/admin/teams/{team}'
*/
destroyForm.delete = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const teams = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    owner: Object.assign(owner, owner),
    members: Object.assign(members, members),
    destroy: Object.assign(destroy, destroy),
}

export default teams