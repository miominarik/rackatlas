import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\ConnectedAccountController::destroy
* @see app/Http/Controllers/Settings/ConnectedAccountController.php:17
* @route '/app/settings/connected-accounts/{provider}'
*/
export const destroy = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/app/settings/connected-accounts/{provider}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\ConnectedAccountController::destroy
* @see app/Http/Controllers/Settings/ConnectedAccountController.php:17
* @route '/app/settings/connected-accounts/{provider}'
*/
destroy.url = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { provider: args }
    }

    if (Array.isArray(args)) {
        args = {
            provider: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        provider: args.provider,
    }

    return destroy.definition.url
            .replace('{provider}', parsedArgs.provider.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\ConnectedAccountController::destroy
* @see app/Http/Controllers/Settings/ConnectedAccountController.php:17
* @route '/app/settings/connected-accounts/{provider}'
*/
destroy.delete = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\ConnectedAccountController::destroy
* @see app/Http/Controllers/Settings/ConnectedAccountController.php:17
* @route '/app/settings/connected-accounts/{provider}'
*/
const destroyForm = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\ConnectedAccountController::destroy
* @see app/Http/Controllers/Settings/ConnectedAccountController.php:17
* @route '/app/settings/connected-accounts/{provider}'
*/
destroyForm.delete = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ConnectedAccountController = { destroy }

export default ConnectedAccountController