import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FeedbackController::store
* @see app/Http/Controllers/FeedbackController.php:16
* @route '/feedback'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/feedback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FeedbackController::store
* @see app/Http/Controllers/FeedbackController.php:16
* @route '/feedback'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FeedbackController::store
* @see app/Http/Controllers/FeedbackController.php:16
* @route '/feedback'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FeedbackController::store
* @see app/Http/Controllers/FeedbackController.php:16
* @route '/feedback'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FeedbackController::store
* @see app/Http/Controllers/FeedbackController.php:16
* @route '/feedback'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const FeedbackController = { store }

export default FeedbackController