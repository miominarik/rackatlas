import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import sessions from './sessions'
/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::exchange
* @see app/Http/Controllers/Api/TerminalBridgeController.php:24
* @route '/api/terminal/exchange'
*/
export const exchange = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exchange.url(options),
    method: 'post',
})

exchange.definition = {
    methods: ["post"],
    url: '/api/terminal/exchange',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::exchange
* @see app/Http/Controllers/Api/TerminalBridgeController.php:24
* @route '/api/terminal/exchange'
*/
exchange.url = (options?: RouteQueryOptions) => {
    return exchange.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::exchange
* @see app/Http/Controllers/Api/TerminalBridgeController.php:24
* @route '/api/terminal/exchange'
*/
exchange.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exchange.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::exchange
* @see app/Http/Controllers/Api/TerminalBridgeController.php:24
* @route '/api/terminal/exchange'
*/
const exchangeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: exchange.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::exchange
* @see app/Http/Controllers/Api/TerminalBridgeController.php:24
* @route '/api/terminal/exchange'
*/
exchangeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: exchange.url(options),
    method: 'post',
})

exchange.form = exchangeForm

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
export const hostKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hostKey.url(options),
    method: 'post',
})

hostKey.definition = {
    methods: ["post"],
    url: '/api/terminal/host-key',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
hostKey.url = (options?: RouteQueryOptions) => {
    return hostKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
hostKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
const hostKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: hostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
hostKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: hostKey.url(options),
    method: 'post',
})

hostKey.form = hostKeyForm

const terminal = {
    sessions: Object.assign(sessions, sessions),
}

export default terminal