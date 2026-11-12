import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
const AgentDockerLogsController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentDockerLogsController.url(options),
    method: 'post',
})

AgentDockerLogsController.definition = {
    methods: ["post"],
    url: '/api/agent/docker-logs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
AgentDockerLogsController.url = (options?: RouteQueryOptions) => {
    return AgentDockerLogsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
AgentDockerLogsController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentDockerLogsController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
const AgentDockerLogsControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: AgentDockerLogsController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
AgentDockerLogsControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: AgentDockerLogsController.url(options),
    method: 'post',
})

AgentDockerLogsController.form = AgentDockerLogsControllerForm

export default AgentDockerLogsController