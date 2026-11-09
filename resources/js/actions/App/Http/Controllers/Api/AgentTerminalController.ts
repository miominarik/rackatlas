import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
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

export default AgentTerminalController