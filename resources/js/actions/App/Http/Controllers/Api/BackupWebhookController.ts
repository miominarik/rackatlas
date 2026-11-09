import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
const BackupWebhookController = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: BackupWebhookController.url(args, options),
    method: 'get',
})

BackupWebhookController.definition = {
    methods: ["get","post","head"],
    url: '/api/webhooks/backups/{token}',
} satisfies RouteDefinition<["get","post","head"]>

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
BackupWebhookController.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return BackupWebhookController.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
BackupWebhookController.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: BackupWebhookController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
BackupWebhookController.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: BackupWebhookController.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
BackupWebhookController.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: BackupWebhookController.url(args, options),
    method: 'head',
})

export default BackupWebhookController