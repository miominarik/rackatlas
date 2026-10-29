import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
export const show = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/app/servers/{server}/agent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
show.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
show.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
show.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
const showForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
showForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::show
* @see app/Http/Controllers/Servers/ServerAgentController.php:18
* @route '/app/servers/{server}/agent'
*/
showForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Servers\ServerAgentController::rotate
* @see app/Http/Controllers/Servers/ServerAgentController.php:44
* @route '/app/servers/{server}/agent/token'
*/
export const rotate = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotate.url(args, options),
    method: 'post',
})

rotate.definition = {
    methods: ["post"],
    url: '/app/servers/{server}/agent/token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::rotate
* @see app/Http/Controllers/Servers/ServerAgentController.php:44
* @route '/app/servers/{server}/agent/token'
*/
rotate.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return rotate.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::rotate
* @see app/Http/Controllers/Servers/ServerAgentController.php:44
* @route '/app/servers/{server}/agent/token'
*/
rotate.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::rotate
* @see app/Http/Controllers/Servers/ServerAgentController.php:44
* @route '/app/servers/{server}/agent/token'
*/
const rotateForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\ServerAgentController::rotate
* @see app/Http/Controllers/Servers/ServerAgentController.php:44
* @route '/app/servers/{server}/agent/token'
*/
rotateForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotate.url(args, options),
    method: 'post',
})

rotate.form = rotateForm

const agent = {
    show: Object.assign(show, show),
    rotate: Object.assign(rotate, rotate),
}

export default agent