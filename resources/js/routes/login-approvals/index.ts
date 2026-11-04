import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
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

const loginApprovals = {
    decide: Object.assign(decide, decide),
}

export default loginApprovals