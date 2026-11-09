import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MapController::__invoke
* @see app/Http/Controllers/MapController.php:15
* @route '/app/map'
*/
const MapController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MapController.url(options),
    method: 'get',
})

MapController.definition = {
    methods: ["get","head"],
    url: '/app/map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MapController::__invoke
* @see app/Http/Controllers/MapController.php:15
* @route '/app/map'
*/
MapController.url = (options?: RouteQueryOptions) => {
    return MapController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MapController::__invoke
* @see app/Http/Controllers/MapController.php:15
* @route '/app/map'
*/
MapController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MapController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MapController::__invoke
* @see app/Http/Controllers/MapController.php:15
* @route '/app/map'
*/
MapController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MapController.url(options),
    method: 'head',
})

export default MapController