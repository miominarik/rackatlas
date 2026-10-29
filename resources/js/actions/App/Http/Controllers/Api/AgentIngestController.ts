import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
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
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
AgentIngestController.url = (options?: RouteQueryOptions) => {
    return AgentIngestController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
AgentIngestController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentIngestController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
const AgentIngestControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: AgentIngestController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
AgentIngestControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: AgentIngestController.url(options),
    method: 'post',
})

AgentIngestController.form = AgentIngestControllerForm

export default AgentIngestController