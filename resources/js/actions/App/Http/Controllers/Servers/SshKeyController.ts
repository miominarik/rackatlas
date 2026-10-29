import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/ssh-keys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::index
* @see app/Http/Controllers/Servers/SshKeyController.php:23
* @route '/app/ssh-keys'
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
* @see \App\Http\Controllers\Servers\SshKeyController::store
* @see app/Http/Controllers/Servers/SshKeyController.php:40
* @route '/app/ssh-keys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/ssh-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\SshKeyController::store
* @see app/Http/Controllers/Servers/SshKeyController.php:40
* @route '/app/ssh-keys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\SshKeyController::store
* @see app/Http/Controllers/Servers/SshKeyController.php:40
* @route '/app/ssh-keys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::store
* @see app/Http/Controllers/Servers/SshKeyController.php:40
* @route '/app/ssh-keys'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::store
* @see app/Http/Controllers/Servers/SshKeyController.php:40
* @route '/app/ssh-keys'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Servers\SshKeyController::destroy
* @see app/Http/Controllers/Servers/SshKeyController.php:70
* @route '/app/ssh-keys/{sshKey}'
*/
export const destroy = (args: { sshKey: number | { id: number } } | [sshKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/ssh-keys/{sshKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Servers\SshKeyController::destroy
* @see app/Http/Controllers/Servers/SshKeyController.php:70
* @route '/app/ssh-keys/{sshKey}'
*/
destroy.url = (args: { sshKey: number | { id: number } } | [sshKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sshKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sshKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sshKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sshKey: typeof args.sshKey === 'object'
        ? args.sshKey.id
        : args.sshKey,
    }

    return destroy.definition.url
            .replace('{sshKey}', parsedArgs.sshKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\SshKeyController::destroy
* @see app/Http/Controllers/Servers/SshKeyController.php:70
* @route '/app/ssh-keys/{sshKey}'
*/
destroy.delete = (args: { sshKey: number | { id: number } } | [sshKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::destroy
* @see app/Http/Controllers/Servers/SshKeyController.php:70
* @route '/app/ssh-keys/{sshKey}'
*/
const destroyForm = (args: { sshKey: number | { id: number } } | [sshKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\SshKeyController::destroy
* @see app/Http/Controllers/Servers/SshKeyController.php:70
* @route '/app/ssh-keys/{sshKey}'
*/
destroyForm.delete = (args: { sshKey: number | { id: number } } | [sshKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const SshKeyController = { index, store, destroy }

export default SshKeyController