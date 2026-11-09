import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/backups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BackupController::index
* @see app/Http/Controllers/BackupController.php:14
* @route '/app/backups'
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
* @see \App\Http\Controllers\BackupController::store
* @see app/Http/Controllers/BackupController.php:29
* @route '/app/backups'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/backups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::store
* @see app/Http/Controllers/BackupController.php:29
* @route '/app/backups'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::store
* @see app/Http/Controllers/BackupController.php:29
* @route '/app/backups'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::store
* @see app/Http/Controllers/BackupController.php:29
* @route '/app/backups'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::store
* @see app/Http/Controllers/BackupController.php:29
* @route '/app/backups'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\BackupController::update
* @see app/Http/Controllers/BackupController.php:38
* @route '/app/backups/{backup}'
*/
export const update = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/backups/{backup}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BackupController::update
* @see app/Http/Controllers/BackupController.php:38
* @route '/app/backups/{backup}'
*/
update.url = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { backup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { backup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            backup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        backup: typeof args.backup === 'object'
        ? args.backup.id
        : args.backup,
    }

    return update.definition.url
            .replace('{backup}', parsedArgs.backup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::update
* @see app/Http/Controllers/BackupController.php:38
* @route '/app/backups/{backup}'
*/
update.put = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\BackupController::update
* @see app/Http/Controllers/BackupController.php:38
* @route '/app/backups/{backup}'
*/
const updateForm = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::update
* @see app/Http/Controllers/BackupController.php:38
* @route '/app/backups/{backup}'
*/
updateForm.put = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BackupController::regenerate
* @see app/Http/Controllers/BackupController.php:54
* @route '/app/backups/{backup}/regenerate'
*/
export const regenerate = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/app/backups/{backup}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::regenerate
* @see app/Http/Controllers/BackupController.php:54
* @route '/app/backups/{backup}/regenerate'
*/
regenerate.url = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { backup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { backup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            backup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        backup: typeof args.backup === 'object'
        ? args.backup.id
        : args.backup,
    }

    return regenerate.definition.url
            .replace('{backup}', parsedArgs.backup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::regenerate
* @see app/Http/Controllers/BackupController.php:54
* @route '/app/backups/{backup}/regenerate'
*/
regenerate.post = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::regenerate
* @see app/Http/Controllers/BackupController.php:54
* @route '/app/backups/{backup}/regenerate'
*/
const regenerateForm = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::regenerate
* @see app/Http/Controllers/BackupController.php:54
* @route '/app/backups/{backup}/regenerate'
*/
regenerateForm.post = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(args, options),
    method: 'post',
})

regenerate.form = regenerateForm

/**
* @see \App\Http\Controllers\BackupController::destroy
* @see app/Http/Controllers/BackupController.php:65
* @route '/app/backups/{backup}'
*/
export const destroy = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/backups/{backup}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BackupController::destroy
* @see app/Http/Controllers/BackupController.php:65
* @route '/app/backups/{backup}'
*/
destroy.url = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { backup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { backup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            backup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        backup: typeof args.backup === 'object'
        ? args.backup.id
        : args.backup,
    }

    return destroy.definition.url
            .replace('{backup}', parsedArgs.backup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::destroy
* @see app/Http/Controllers/BackupController.php:65
* @route '/app/backups/{backup}'
*/
destroy.delete = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\BackupController::destroy
* @see app/Http/Controllers/BackupController.php:65
* @route '/app/backups/{backup}'
*/
const destroyForm = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BackupController::destroy
* @see app/Http/Controllers/BackupController.php:65
* @route '/app/backups/{backup}'
*/
destroyForm.delete = (args: { backup: number | { id: number } } | [backup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const BackupController = { index, store, update, regenerate, destroy }

export default BackupController