import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Api\TerminalBridgeController::agentAuth
* @see app/Http/Controllers/Api/TerminalBridgeController.php:79
* @route '/api/terminal/agent-auth'
*/
const agentAuthForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: agentAuth.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::agentAuth
* @see app/Http/Controllers/Api/TerminalBridgeController.php:79
* @route '/api/terminal/agent-auth'
*/
agentAuthForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: agentAuth.url(options),
    method: 'post',
})

agentAuth.form = agentAuthForm

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
* @see \App\Http\Controllers\Api\TerminalBridgeController::sessionEnded
* @see app/Http/Controllers/Api/TerminalBridgeController.php:95
* @route '/api/terminal/session-ended'
*/
const sessionEndedForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sessionEnded.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::sessionEnded
* @see app/Http/Controllers/Api/TerminalBridgeController.php:95
* @route '/api/terminal/session-ended'
*/
sessionEndedForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sessionEnded.url(options),
    method: 'post',
})

sessionEnded.form = sessionEndedForm

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
export const pinHostKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pinHostKey.url(options),
    method: 'post',
})

pinHostKey.definition = {
    methods: ["post"],
    url: '/api/terminal/host-key',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
pinHostKey.url = (options?: RouteQueryOptions) => {
    return pinHostKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
pinHostKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pinHostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
const pinHostKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pinHostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:118
* @route '/api/terminal/host-key'
*/
pinHostKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pinHostKey.url(options),
    method: 'post',
})

pinHostKey.form = pinHostKeyForm

const TerminalBridgeController = { exchange, agentAuth, sessionEnded, pinHostKey }

export default TerminalBridgeController