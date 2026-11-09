import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
export const backups = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: backups.url(args, options),
    method: 'get',
})

backups.definition = {
    methods: ["get","post","head"],
    url: '/api/webhooks/backups/{token}',
} satisfies RouteDefinition<["get","post","head"]>

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
backups.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return backups.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
backups.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: backups.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
backups.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: backups.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\BackupWebhookController::__invoke
* @see app/Http/Controllers/Api/BackupWebhookController.php:16
* @route '/api/webhooks/backups/{token}'
*/
backups.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: backups.url(args, options),
    method: 'head',
})

const webhooks = {
    backups: Object.assign(backups, backups),
}

export default webhooks