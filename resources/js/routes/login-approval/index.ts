import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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

const loginApproval = {
    show: Object.assign(show, show),
    status: Object.assign(status, status),
    renew: Object.assign(renew, renew),
    code: Object.assign(code, code),
}

export default loginApproval