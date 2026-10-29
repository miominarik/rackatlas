<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The public home page. Signed-in users see it too, with a link to the app.
     */
    public function __invoke(Request $request): Response
    {
        return Inertia::render('welcome', [
            'canRegister' => Route::has('register'),
            'canonicalUrl' => route('home'),
        ]);
    }
}
