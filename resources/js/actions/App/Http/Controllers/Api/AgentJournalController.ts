import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
const AgentJournalController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentJournalController.url(options),
    method: 'post',
})

AgentJournalController.definition = {
    methods: ["post"],
    url: '/api/agent/journal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
AgentJournalController.url = (options?: RouteQueryOptions) => {
    return AgentJournalController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
AgentJournalController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: AgentJournalController.url(options),
    method: 'post',
})

export default AgentJournalController