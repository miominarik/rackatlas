import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:22
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
* @see app/Http/Controllers/Api/AgentIngestController.php:22
* @route '/api/agent/ingest'
*/
ingest.url = (options?: RouteQueryOptions) => {
    return ingest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:22
* @route '/api/agent/ingest'
*/
ingest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ingest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:22
* @route '/api/agent/ingest'
*/
const ingestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ingest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentIngestController::__invoke
* @see app/Http/Controllers/Api/AgentIngestController.php:22
* @route '/api/agent/ingest'
*/
ingestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ingest.url(options),
    method: 'post',
})

ingest.form = ingestForm

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
export const journal = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: journal.url(options),
    method: 'post',
})

journal.definition = {
    methods: ["post"],
    url: '/api/agent/journal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
journal.url = (options?: RouteQueryOptions) => {
    return journal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
journal.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: journal.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
const journalForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: journal.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentJournalController::__invoke
* @see app/Http/Controllers/Api/AgentJournalController.php:17
* @route '/api/agent/journal'
*/
journalForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: journal.url(options),
    method: 'post',
})

journal.form = journalForm

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
export const dockerLogs = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dockerLogs.url(options),
    method: 'post',
})

dockerLogs.definition = {
    methods: ["post"],
    url: '/api/agent/docker-logs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
dockerLogs.url = (options?: RouteQueryOptions) => {
    return dockerLogs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
dockerLogs.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dockerLogs.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
const dockerLogsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dockerLogs.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AgentDockerLogsController::__invoke
* @see app/Http/Controllers/Api/AgentDockerLogsController.php:17
* @route '/api/agent/docker-logs'
*/
dockerLogsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dockerLogs.url(options),
    method: 'post',
})

dockerLogs.form = dockerLogsForm

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
export const terminal = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terminal.url(options),
    method: 'get',
})

terminal.definition = {
    methods: ["get","head"],
    url: '/api/agent/terminal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
terminal.url = (options?: RouteQueryOptions) => {
    return terminal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
terminal.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terminal.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
terminal.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: terminal.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
const terminalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: terminal.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
terminalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: terminal.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AgentTerminalController::__invoke
* @see app/Http/Controllers/Api/AgentTerminalController.php:15
* @route '/api/agent/terminal'
*/
terminalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: terminal.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

terminal.form = terminalForm

const agent = {
    ingest: Object.assign(ingest, ingest),
    journal: Object.assign(journal, journal),
    dockerLogs: Object.assign(dockerLogs, dockerLogs),
    terminal: Object.assign(terminal, terminal),
}

export default agent