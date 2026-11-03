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
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
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
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
pinHostKey.url = (options?: RouteQueryOptions) => {
    return pinHostKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
pinHostKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pinHostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
const pinHostKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pinHostKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TerminalBridgeController::pinHostKey
* @see app/Http/Controllers/Api/TerminalBridgeController.php:69
* @route '/api/terminal/host-key'
*/
pinHostKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pinHostKey.url(options),
    method: 'post',
})

pinHostKey.form = pinHostKeyForm

const TerminalBridgeController = { exchange, pinHostKey }

export default TerminalBridgeController