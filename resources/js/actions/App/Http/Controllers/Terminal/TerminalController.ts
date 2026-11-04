import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
const TerminalControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
TerminalControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalController::__invoke
* @see app/Http/Controllers/Terminal/TerminalController.php:16
* @route '/app/terminal'
*/
TerminalControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TerminalController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

TerminalController.form = TerminalControllerForm

export default TerminalController