<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The external API speaks JSON only: requests with a body must be JSON, a client that accepts nothing
 * but another format is refused, and every answer (errors included) is JSON.
 */
class RequireJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $accept = (string) $request->header('Accept', '');

        if ($accept !== '' && ! preg_match('#(\*/\*|application/(\*|json|[a-z.+-]*\+json))#i', $accept)) {
            return response()->json(['message' => 'This API answers with application/json only.'], 406);
        }

        if ($request->getContent() !== '' && ! $request->isJson()) {
            return response()->json(['message' => 'The request body must be application/json.'], 415);
        }

        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
