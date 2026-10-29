import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
export const ingest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ingest.url(options),
    method: 'post',
})

ingest.definition = {
    methods: ["post"],
    url: '/api/agent/ingest',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
ingest.url = (options?: RouteQueryOptions) => {
    return ingest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
ingest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ingest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
const ingestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ingest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:20
* @route '/api/agent/ingest'
*/
ingestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ingest.url(options),
    method: 'post',
})

ingest.form = ingestForm

const agent = {
    ingest: Object.assign(ingest, ingest),
}

export default agent