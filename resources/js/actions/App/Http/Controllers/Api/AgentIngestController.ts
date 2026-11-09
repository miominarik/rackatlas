import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:21
* @route '/api/agent/ingest'
*/
const AgentIngestController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentIngestController.url(options),
    method: 'post',
})

AgentIngestController.definition = {
    methods: ["post"],
    url: '/api/agent/ingest',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:21
* @route '/api/agent/ingest'
*/
AgentIngestController.url = (options?: RouteQueryOptions) => {
    return AgentIngestController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:21
* @route '/api/agent/ingest'
*/
AgentIngestController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentIngestController.url(options),
    method: 'post',
})

export default AgentIngestController