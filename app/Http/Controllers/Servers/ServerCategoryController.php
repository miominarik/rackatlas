<?php

namespace App\Http\Controllers\Servers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\ServerCategoryRequest;
use App\Models\ServerCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ServerCategoryController extends Controller
{
    public function store(ServerCategoryRequest $request): RedirectResponse
    {
        $request->user()->currentTeam()->serverCategories()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return back();
    }

    public function update(ServerCategoryRequest $request, ServerCategory $serverCategory): RedirectResponse
    {
        $serverCategory->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    public function destroy(ServerCategory $serverCategory): RedirectResponse
    {
        $this->authorize('manage', $serverCategory->team);

        $serverCategory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }
}
