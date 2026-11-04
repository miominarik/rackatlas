import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
const AgentTerminalController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: AgentTerminalController.url(options),
    method: 'get',
})

AgentTerminalController.definition = {
    methods: ["get","head"],
    url: '/api/agent/terminal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
AgentTerminalController.url = (options?: RouteQueryOptions) => {
    return AgentTerminalController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
AgentTerminalController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: AgentTerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
AgentTerminalController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: AgentTerminalController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
const AgentTerminalControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AgentTerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
AgentTerminalControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AgentTerminalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
AgentTerminalControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: AgentTerminalController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

AgentTerminalController.form = AgentTerminalControllerForm

export default AgentTerminalController