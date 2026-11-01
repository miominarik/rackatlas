import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/storage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::index
* @see app/Http/Controllers/Storage/StorageMonitorController.php:25
* @route '/app/storage'
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
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/app/storage/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::create
* @see app/Http/Controllers/Storage/StorageMonitorController.php:39
* @route '/app/storage/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::store
* @see app/Http/Controllers/Storage/StorageMonitorController.php:52
* @route '/app/storage'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/storage',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::store
* @see app/Http/Controllers/Storage/StorageMonitorController.php:52
* @route '/app/storage'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::store
* @see app/Http/Controllers/Storage/StorageMonitorController.php:52
* @route '/app/storage'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::store
* @see app/Http/Controllers/Storage/StorageMonitorController.php:52
* @route '/app/storage'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::store
* @see app/Http/Controllers/Storage/StorageMonitorController.php:52
* @route '/app/storage'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
export const show = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/storage/{monitor}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
show.url = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { monitor: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { monitor: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            monitor: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        monitor: typeof args.monitor === 'object'
        ? args.monitor.id
        : args.monitor,
    }

    return show.definition.url
            .replace('{monitor}', parsedArgs.monitor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
show.get = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
show.head = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
const showForm = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
showForm.get = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::show
* @see app/Http/Controllers/Storage/StorageMonitorController.php:64
* @route '/app/storage/{monitor}'
*/
showForm.head = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
export const edit = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/app/storage/{monitor}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
edit.url = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { monitor: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { monitor: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            monitor: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        monitor: typeof args.monitor === 'object'
        ? args.monitor.id
        : args.monitor,
    }

    return edit.definition.url
            .replace('{monitor}', parsedArgs.monitor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
edit.get = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
edit.head = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
const editForm = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
editForm.get = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::edit
* @see app/Http/Controllers/Storage/StorageMonitorController.php:94
* @route '/app/storage/{monitor}/edit'
*/
editForm.head = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::update
* @see app/Http/Controllers/Storage/StorageMonitorController.php:103
* @route '/app/storage/{monitor}'
*/
export const update = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/storage/{monitor}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::update
* @see app/Http/Controllers/Storage/StorageMonitorController.php:103
* @route '/app/storage/{monitor}'
*/
update.url = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { monitor: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { monitor: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            monitor: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        monitor: typeof args.monitor === 'object'
        ? args.monitor.id
        : args.monitor,
    }

    return update.definition.url
            .replace('{monitor}', parsedArgs.monitor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::update
* @see app/Http/Controllers/Storage/StorageMonitorController.php:103
* @route '/app/storage/{monitor}'
*/
update.put = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::update
* @see app/Http/Controllers/Storage/StorageMonitorController.php:103
* @route '/app/storage/{monitor}'
*/
const updateForm = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::update
* @see app/Http/Controllers/Storage/StorageMonitorController.php:103
* @route '/app/storage/{monitor}'
*/
updateForm.put = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Storage\StorageMonitorController::check
* @see app/Http/Controllers/Storage/StorageMonitorController.php:123
* @route '/app/storage/{monitor}/check'
*/
export const check = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/app/storage/{monitor}/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::check
* @see app/Http/Controllers/Storage/StorageMonitorController.php:123
* @route '/app/storage/{monitor}/check'
*/
check.url = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { monitor: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { monitor: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            monitor: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        monitor: typeof args.monitor === 'object'
        ? args.monitor.id
        : args.monitor,
    }

    return check.definition.url
            .replace('{monitor}', parsedArgs.monitor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::check
* @see app/Http/Controllers/Storage/StorageMonitorController.php:123
* @route '/app/storage/{monitor}/check'
*/
check.post = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::check
* @see app/Http/Controllers/Storage/StorageMonitorController.php:123
* @route '/app/storage/{monitor}/check'
*/
const checkForm = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::check
* @see app/Http/Controllers/Storage/StorageMonitorController.php:123
* @route '/app/storage/{monitor}/check'
*/
checkForm.post = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(args, options),
    method: 'post',
})

check.form = checkForm

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::destroy
* @see app/Http/Controllers/Storage/StorageMonitorController.php:134
* @route '/app/storage/{monitor}'
*/
export const destroy = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/storage/{monitor}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::destroy
* @see app/Http/Controllers/Storage/StorageMonitorController.php:134
* @route '/app/storage/{monitor}'
*/
destroy.url = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { monitor: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { monitor: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            monitor: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        monitor: typeof args.monitor === 'object'
        ? args.monitor.id
        : args.monitor,
    }

    return destroy.definition.url
            .replace('{monitor}', parsedArgs.monitor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::destroy
* @see app/Http/Controllers/Storage/StorageMonitorController.php:134
* @route '/app/storage/{monitor}'
*/
destroy.delete = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::destroy
* @see app/Http/Controllers/Storage/StorageMonitorController.php:134
* @route '/app/storage/{monitor}'
*/
const destroyForm = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Storage\StorageMonitorController::destroy
* @see app/Http/Controllers/Storage/StorageMonitorController.php:134
* @route '/app/storage/{monitor}'
*/
destroyForm.delete = (args: { monitor: number | { id: number } } | [monitor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const StorageMonitorController = { index, create, store, show, edit, update, check, destroy }

export default StorageMonitorController