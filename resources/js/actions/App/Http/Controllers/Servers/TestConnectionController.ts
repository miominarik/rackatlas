import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Servers\TestConnectionController::__invoke
* @see app/Http/Controllers/Servers/TestConnectionController.php:18
* @route '/app/servers/test-connection'
*/
const TestConnectionController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: TestConnectionController.url(options),
    method: 'post',
})

TestConnectionController.definition = {
    methods: ["post"],
    url: '/app/servers/test-connection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Servers\TestConnectionController::__invoke
* @see app/Http/Controllers/Servers/TestConnectionController.php:18
* @route '/app/servers/test-connection'
*/
TestConnectionController.url = (options?: RouteQueryOptions) => {
    return TestConnectionController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Servers\TestConnectionController::__invoke
* @see app/Http/Controllers/Servers/TestConnectionController.php:18
* @route '/app/servers/test-connection'
*/
TestConnectionController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: TestConnectionController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\TestConnectionController::__invoke
* @see app/Http/Controllers/Servers/TestConnectionController.php:18
* @route '/app/servers/test-connection'
*/
const TestConnectionControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: TestConnectionController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Servers\TestConnectionController::__invoke
* @see app/Http/Controllers/Servers/TestConnectionController.php:18
* @route '/app/servers/test-connection'
*/
TestConnectionControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: TestConnectionController.url(options),
    method: 'post',
})

TestConnectionController.form = TestConnectionControllerForm

export default TestConnectionController