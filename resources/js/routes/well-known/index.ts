import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
export const passkeys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: passkeys.url(options),
    method: 'get',
})

passkeys.definition = {
    methods: ["get","head"],
    url: '/.well-known/passkey-endpoints',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
passkeys.url = (options?: RouteQueryOptions) => {
    return passkeys.definition.url + queryParams(options)
}

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
passkeys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: passkeys.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
passkeys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: passkeys.url(options),
    method: 'head',
})

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
const passkeysForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
passkeysForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:103
* @route '/.well-known/passkey-endpoints'
*/
passkeysForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

passkeys.form = passkeysForm

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
export const assetlinks = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assetlinks.url(options),
    method: 'get',
})

assetlinks.definition = {
    methods: ["get","head"],
    url: '/.well-known/assetlinks.json',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
assetlinks.url = (options?: RouteQueryOptions) => {
    return assetlinks.definition.url + queryParams(options)
}

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
assetlinks.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assetlinks.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
assetlinks.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: assetlinks.url(options),
    method: 'head',
})

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
const assetlinksForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assetlinks.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
assetlinksForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assetlinks.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:110
* @route '/.well-known/assetlinks.json'
*/
assetlinksForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assetlinks.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

assetlinks.form = assetlinksForm

const wellKnown = {
    passkeys: Object.assign(passkeys, passkeys),
    assetlinks: Object.assign(assetlinks, assetlinks),
}

export default wellKnown