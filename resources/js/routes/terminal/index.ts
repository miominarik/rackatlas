import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
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
* @see \App\Http\Controllers\Api\TerminalBridgeController::agentAuth
* @see app/Http/Controllers/Api/TerminalBridgeController.php:79
* @route '/api/terminal/agent-auth'
*/
export const agentAuth = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: agentAuth.url(options),
    method: 'post',
})

agentAuth.definition = {
    methods: ["post"],
    url: '/api/terminal/agent-auth',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::agentAuth
* @see app/Http/Controllers/Api/TerminalBridgeController.php:79
* @route '/api/terminal/agent-auth'
*/
agentAuth.url = (options?: RouteQueryOptions) => {
    return agentAuth.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::agentAuth
* @see app/Http/Controllers/Api/TerminalBridgeController.php:79
* @route '/api/terminal/agent-auth'
*/
agentAuth.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: agentAuth.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::sessionEnded
* @see app/Http/Controllers/Api/TerminalBridgeController.php:95
* @route '/api/terminal/session-ended'
*/
export const sessionEnded = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sessionEnded.url(options),
    method: 'post',
})

sessionEnded.definition = {
    methods: ["post"],
    url: '/api/terminal/session-ended',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::sessionEnded
* @see app/Http/Controllers/Api/TerminalBridgeController.php:95
* @route '/api/terminal/session-ended'
*/
sessionEnded.url = (options?: RouteQueryOptions) => {
    return sessionEnded.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::sessionEnded
* @see app/Http/Controllers/Api/TerminalBridgeController.php:95
* @route '/api/terminal/session-ended'
*/
sessionEnded.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sessionEnded.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
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
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
hostKey.url = (options?: RouteQueryOptions) => {
    return hostKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::hostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
hostKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hostKey.url(options),
    method: 'post',
})

const terminal = {
    sessions: Object.assign(sessions, sessions),
}

export default terminal