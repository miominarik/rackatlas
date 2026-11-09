import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CrawlerController::robots
* @see app/Http/Controllers/CrawlerController.php:12
* @route '/robots.txt'
*/
export const robots = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: robots.url(options),
    method: 'get',
})

robots.definition = {
    methods: ["get","head"],
    url: '/robots.txt',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CrawlerController::robots
* @see app/Http/Controllers/CrawlerController.php:12
* @route '/robots.txt'
*/
robots.url = (options?: RouteQueryOptions) => {
    return robots.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CrawlerController::robots
* @see app/Http/Controllers/CrawlerController.php:12
* @route '/robots.txt'
*/
robots.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: robots.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CrawlerController::robots
* @see app/Http/Controllers/CrawlerController.php:12
* @route '/robots.txt'
*/
robots.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: robots.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CrawlerController::sitemap
* @see app/Http/Controllers/CrawlerController.php:29
* @route '/sitemap.xml'
*/
export const sitemap = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sitemap.url(options),
    method: 'get',
})

sitemap.definition = {
    methods: ["get","head"],
    url: '/sitemap.xml',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CrawlerController::sitemap
* @see app/Http/Controllers/CrawlerController.php:29
* @route '/sitemap.xml'
*/
sitemap.url = (options?: RouteQueryOptions) => {
    return sitemap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CrawlerController::sitemap
* @see app/Http/Controllers/CrawlerController.php:29
* @route '/sitemap.xml'
*/
sitemap.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sitemap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CrawlerController::sitemap
* @see app/Http/Controllers/CrawlerController.php:29
* @route '/sitemap.xml'
*/
sitemap.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sitemap.url(options),
    method: 'head',
})

const CrawlerController = { robots, sitemap }

export default CrawlerController