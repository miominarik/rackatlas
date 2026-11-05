import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
const MeController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MeController.url(options),
    method: 'get',
})

MeController.definition = {
    methods: ["get","head"],
    url: '/api/v1/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
MeController.url = (options?: RouteQueryOptions) => {
    return MeController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
MeController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MeController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
MeController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MeController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
const MeControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MeController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
MeControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MeController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\MeController::__invoke
* @see app/Http/Controllers/Api/V1/MeController.php:13
* @route '/api/v1/me'
*/
MeControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: MeController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

MeController.form = MeControllerForm

export default MeController