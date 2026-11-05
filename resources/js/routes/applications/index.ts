import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import journalEdd021 from './journal'
/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/app/applications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::index
* @see app/Http/Controllers/ApplicationController.php:20
* @route '/app/applications'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
export const journal = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: journal.url(args, options),
    method: 'get',
})

journal.definition = {
    methods: ["get","head"],
    url: '/app/applications/{service}/journal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
journal.url = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { service: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { service: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            service: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        service: typeof args.service === 'object'
        ? args.service.id
        : args.service,
    }

    return journal.definition.url
            .replace('{service}', parsedArgs.service.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
journal.get = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: journal.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
journal.head = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: journal.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
const journalForm = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: journal.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
journalForm.get = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: journal.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApplicationController::journal
* @see app/Http/Controllers/ApplicationController.php:77
* @route '/app/applications/{service}/journal'
*/
journalForm.head = (args: { service: number | { id: number } } | [service: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: journal.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

journal.form = journalForm

const applications = {
    index: Object.assign(index, index),
    journal: Object.assign(journal, journalEdd021),
}

export default applications