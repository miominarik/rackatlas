<?php

namespace App\Http\Controllers;

use App\Http\Requests\FeedbackRequest;
use App\Mail\FeedbackMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class FeedbackController extends Controller
{
    /**
     * Take an opinion from a visitor of the home page and pass it on by email.
     * The address it goes to stays on the server.
     */
    public function store(FeedbackRequest $request): RedirectResponse
    {
        $to = config('services.feedback.to');

        if (is_string($to) && $to !== '') {
            Mail::to($to)->send(new FeedbackMail(
                $request->string('name')->trim()->toString(),
                $request->string('email')->trim()->toString(),
                $request->string('message')->trim()->toString(),
                app()->getLocale(),
            ));
        }

        return back();
    }
}
