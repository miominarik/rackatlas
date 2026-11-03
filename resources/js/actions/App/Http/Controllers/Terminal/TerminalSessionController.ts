import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:23
* @route '/app/terminal/sessions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/terminal/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:23
* @route '/app/terminal/sessions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:23
* @route '/app/terminal/sessions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:23
* @route '/app/terminal/sessions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:23
* @route '/app/terminal/sessions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::attach
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:51
* @route '/app/terminal/sessions/{session}/attach'
*/
export const attach = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

attach.definition = {
    methods: ["post"],
    url: '/app/terminal/sessions/{session}/attach',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::attach
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:51
* @route '/app/terminal/sessions/{session}/attach'
*/
attach.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: args.session,
    }

    return attach.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::attach
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:51
* @route '/app/terminal/sessions/{session}/attach'
*/
attach.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::attach
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:51
* @route '/app/terminal/sessions/{session}/attach'
*/
const attachForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: attach.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::attach
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:51
* @route '/app/terminal/sessions/{session}/attach'
*/
attachForm.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: attach.url(args, options),
    method: 'post',
})

attach.form = attachForm

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::input
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:63
* @route '/app/terminal/sessions/{session}/input'
*/
export const input = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: input.url(args, options),
    method: 'post',
})

input.definition = {
    methods: ["post"],
    url: '/app/terminal/sessions/{session}/input',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::input
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:63
* @route '/app/terminal/sessions/{session}/input'
*/
input.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: args.session,
    }

    return input.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::input
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:63
* @route '/app/terminal/sessions/{session}/input'
*/
input.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: input.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::input
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:63
* @route '/app/terminal/sessions/{session}/input'
*/
const inputForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: input.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::input
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:63
* @route '/app/terminal/sessions/{session}/input'
*/
inputForm.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: input.url(args, options),
    method: 'post',
})

input.form = inputForm

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::resize
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:74
* @route '/app/terminal/sessions/{session}/resize'
*/
export const resize = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resize.url(args, options),
    method: 'post',
})

resize.definition = {
    methods: ["post"],
    url: '/app/terminal/sessions/{session}/resize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::resize
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:74
* @route '/app/terminal/sessions/{session}/resize'
*/
resize.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: args.session,
    }

    return resize.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::resize
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:74
* @route '/app/terminal/sessions/{session}/resize'
*/
resize.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resize.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::resize
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:74
* @route '/app/terminal/sessions/{session}/resize'
*/
const resizeForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resize.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::resize
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:74
* @route '/app/terminal/sessions/{session}/resize'
*/
resizeForm.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resize.url(args, options),
    method: 'post',
})

resize.form = resizeForm

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::destroy
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:88
* @route '/app/terminal/sessions/{session}'
*/
export const destroy = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/terminal/sessions/{session}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::destroy
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:88
* @route '/app/terminal/sessions/{session}'
*/
destroy.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: args.session,
    }

    return destroy.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::destroy
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:88
* @route '/app/terminal/sessions/{session}'
*/
destroy.delete = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::destroy
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:88
* @route '/app/terminal/sessions/{session}'
*/
const destroyForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::destroy
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:88
* @route '/app/terminal/sessions/{session}'
*/
destroyForm.delete = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const TerminalSessionController = { store, attach, input, resize, destroy }

export default TerminalSessionController