import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:20
* @route '/app/terminal/sessions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/app/terminal/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:20
* @route '/app/terminal/sessions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:20
* @route '/app/terminal/sessions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:20
* @route '/app/terminal/sessions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Terminal\TerminalSessionController::store
* @see app/Http/Controllers/Terminal/TerminalSessionController.php:20
* @route '/app/terminal/sessions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const TerminalSessionController = { store }

export default TerminalSessionController