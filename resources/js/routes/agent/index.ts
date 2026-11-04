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
    terminal: Object.assign(terminal, terminal),
}

export default agent