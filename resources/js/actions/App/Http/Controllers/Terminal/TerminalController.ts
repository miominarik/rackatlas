import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
const TerminalController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TerminalController.url(options),
    method: 'get',
})

TerminalController.definition = {
    methods: ["get","head"],
    url: '/app/terminal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
TerminalController.url = (options?: RouteQueryOptions) => {
    return TerminalController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
TerminalController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
TerminalController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: TerminalController.url(options),
    method: 'head',
})

export default TerminalController