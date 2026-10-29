import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CurrentTeamController::update
* @see app/Http/Controllers/CurrentTeamController.php:15
* @route '/app/current-team'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/app/current-team',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\CurrentTeamController::update
* @see app/Http/Controllers/CurrentTeamController.php:15
* @route '/app/current-team'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrentTeamController::update
* @see app/Http/Controllers/CurrentTeamController.php:15
* @route '/app/current-team'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\CurrentTeamController::update
* @see app/Http/Controllers/CurrentTeamController.php:15
* @route '/app/current-team'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CurrentTeamController::update
* @see app/Http/Controllers/CurrentTeamController.php:15
* @route '/app/current-team'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const currentTeam = {
    update: Object.assign(update, update),
}

export default currentTeam