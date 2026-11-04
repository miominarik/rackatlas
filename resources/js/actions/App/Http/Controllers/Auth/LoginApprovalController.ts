import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/login/approval',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::show
* @see app/Http/Controllers/Auth/LoginApprovalController.php:25
* @route '/login/approval'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/login/approval/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
statusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::status
* @see app/Http/Controllers/Auth/LoginApprovalController.php:49
* @route '/login/approval/status'
*/
statusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status.form = statusForm

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::renew
* @see app/Http/Controllers/Auth/LoginApprovalController.php:64
* @route '/login/approval/renew'
*/
export const renew = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: renew.url(options),
    method: 'post',
})

renew.definition = {
    methods: ["post"],
    url: '/login/approval/renew',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::renew
* @see app/Http/Controllers/Auth/LoginApprovalController.php:64
* @route '/login/approval/renew'
*/
renew.url = (options?: RouteQueryOptions) => {
    return renew.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::renew
* @see app/Http/Controllers/Auth/LoginApprovalController.php:64
* @route '/login/approval/renew'
*/
renew.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: renew.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::renew
* @see app/Http/Controllers/Auth/LoginApprovalController.php:64
* @route '/login/approval/renew'
*/
const renewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: renew.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::renew
* @see app/Http/Controllers/Auth/LoginApprovalController.php:64
* @route '/login/approval/renew'
*/
renewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: renew.url(options),
    method: 'post',
})

renew.form = renewForm

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::code
* @see app/Http/Controllers/Auth/LoginApprovalController.php:82
* @route '/login/approval/code'
*/
export const code = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: code.url(options),
    method: 'post',
})

code.definition = {
    methods: ["post"],
    url: '/login/approval/code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::code
* @see app/Http/Controllers/Auth/LoginApprovalController.php:82
* @route '/login/approval/code'
*/
code.url = (options?: RouteQueryOptions) => {
    return code.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::code
* @see app/Http/Controllers/Auth/LoginApprovalController.php:82
* @route '/login/approval/code'
*/
code.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: code.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::code
* @see app/Http/Controllers/Auth/LoginApprovalController.php:82
* @route '/login/approval/code'
*/
const codeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: code.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::code
* @see app/Http/Controllers/Auth/LoginApprovalController.php:82
* @route '/login/approval/code'
*/
codeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: code.url(options),
    method: 'post',
})

code.form = codeForm

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::decide
* @see app/Http/Controllers/Auth/LoginApprovalController.php:128
* @route '/app/login-approvals/{approval}'
*/
export const decide = (args: { approval: string | number | { id: string | number } } | [approval: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/app/login-approvals/{approval}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::decide
* @see app/Http/Controllers/Auth/LoginApprovalController.php:128
* @route '/app/login-approvals/{approval}'
*/
decide.url = (args: { approval: string | number | { id: string | number } } | [approval: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { approval: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            approval: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        approval: typeof args.approval === 'object'
        ? args.approval.id
        : args.approval,
    }

    return decide.definition.url
            .replace('{approval}', parsedArgs.approval.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::decide
* @see app/Http/Controllers/Auth/LoginApprovalController.php:128
* @route '/app/login-approvals/{approval}'
*/
decide.post = (args: { approval: string | number | { id: string | number } } | [approval: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::decide
* @see app/Http/Controllers/Auth/LoginApprovalController.php:128
* @route '/app/login-approvals/{approval}'
*/
const decideForm = (args: { approval: string | number | { id: string | number } } | [approval: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\LoginApprovalController::decide
* @see app/Http/Controllers/Auth/LoginApprovalController.php:128
* @route '/app/login-approvals/{approval}'
*/
decideForm.post = (args: { approval: string | number | { id: string | number } } | [approval: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, options),
    method: 'post',
})

decide.form = decideForm

const LoginApprovalController = { show, status, renew, code, decide }

export default LoginApprovalController