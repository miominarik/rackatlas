import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/servers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::index
* @see app/Http/Controllers/Servers/ServerController.php:23
* @route '/app/servers'
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
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/app/servers/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::create
* @see app/Http/Controllers/Servers/ServerController.php:63
* @route '/app/servers/create'
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
* @see \App\Http\Controllers\Servers\ServerController::store
* @see app/Http/Controllers/Servers/ServerController.php:79
* @route '/app/servers'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/servers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::store
* @see app/Http/Controllers/Servers/ServerController.php:79
* @route '/app/servers'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::store
* @see app/Http/Controllers/Servers/ServerController.php:79
* @route '/app/servers'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::store
* @see app/Http/Controllers/Servers/ServerController.php:79
* @route '/app/servers'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::store
* @see app/Http/Controllers/Servers/ServerController.php:79
* @route '/app/servers'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
export const edit = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/app/servers/{server}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
edit.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { server: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
    }

    return edit.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
edit.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
edit.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
const editForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
editForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::edit
* @see app/Http/Controllers/Servers/ServerController.php:93
* @route '/app/servers/{server}/edit'
*/
editForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Servers\ServerController::update
* @see app/Http/Controllers/Servers/ServerController.php:130
* @route '/app/servers/{server}'
*/
export const update = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/servers/{server}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::update
* @see app/Http/Controllers/Servers/ServerController.php:130
* @route '/app/servers/{server}'
*/
update.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { server: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
    }

    return update.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::update
* @see app/Http/Controllers/Servers/ServerController.php:130
* @route '/app/servers/{server}'
*/
update.put = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::update
* @see app/Http/Controllers/Servers/ServerController.php:130
* @route '/app/servers/{server}'
*/
const updateForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::update
* @see app/Http/Controllers/Servers/ServerController.php:130
* @route '/app/servers/{server}'
*/
updateForm.put = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Servers\ServerController::forgetHostKey
* @see app/Http/Controllers/Servers/ServerController.php:116
* @route '/app/servers/{server}/host-key'
*/
export const forgetHostKey = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forgetHostKey.url(args, options),
    method: 'delete',
})

forgetHostKey.definition = {
    methods: ["delete"],
    url: '/app/servers/{server}/host-key',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::forgetHostKey
* @see app/Http/Controllers/Servers/ServerController.php:116
* @route '/app/servers/{server}/host-key'
*/
forgetHostKey.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { server: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
    }

    return forgetHostKey.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::forgetHostKey
* @see app/Http/Controllers/Servers/ServerController.php:116
* @route '/app/servers/{server}/host-key'
*/
forgetHostKey.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forgetHostKey.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::forgetHostKey
* @see app/Http/Controllers/Servers/ServerController.php:116
* @route '/app/servers/{server}/host-key'
*/
const forgetHostKeyForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forgetHostKey.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::forgetHostKey
* @see app/Http/Controllers/Servers/ServerController.php:116
* @route '/app/servers/{server}/host-key'
*/
forgetHostKeyForm.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forgetHostKey.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

forgetHostKey.form = forgetHostKeyForm

/**
* @see \App\Http\Controllers\Servers\ServerController::destroy
* @see app/Http/Controllers/Servers/ServerController.php:152
* @route '/app/servers/{server}'
*/
export const destroy = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/servers/{server}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\ServerController::destroy
* @see app/Http/Controllers/Servers/ServerController.php:152
* @route '/app/servers/{server}'
*/
destroy.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { server: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            server: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        server: typeof args.server === 'object'
        ? args.server.id
        : args.server,
    }

    return destroy.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerController::destroy
* @see app/Http/Controllers/Servers/ServerController.php:152
* @route '/app/servers/{server}'
*/
destroy.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::destroy
* @see app/Http/Controllers/Servers/ServerController.php:152
* @route '/app/servers/{server}'
*/
const destroyForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerController::destroy
* @see app/Http/Controllers/Servers/ServerController.php:152
* @route '/app/servers/{server}'
*/
destroyForm.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ServerController = { index, create, store, edit, update, forgetHostKey, destroy }

export default ServerController