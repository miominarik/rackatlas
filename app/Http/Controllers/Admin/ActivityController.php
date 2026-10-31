<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
    private const PER_PAGE = 50;

    private const LOGS = ['auth', 'admin', 'user', 'team', 'server', 'ssh-key', 'category'];

    public function index(Request $request): Response
    {
        $log = in_array($request->query('log'), self::LOGS, true) ? $request->query('log') : null;
        $search = trim((string) $request->query('search', ''));

        $activities = Activity::query()
            ->with(['causer:id,name,email', 'subject'])
            ->when($log !== null, fn ($query) => $query->inLog($log))
            ->when($search !== '', fn ($query) => $query->whereHasMorph(
                'causer',
                [User::class],
                fn ($causer) => $causer->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
            ))
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'log' => $activity->log_name,
                'event' => $activity->event,
                'causer' => $activity->causer?->only('id', 'name', 'email'),
                'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                'subject_id' => $activity->subject_id,
                'subject_label' => $this->label($activity),
                'changes' => $activity->attribute_changes,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/activity', [
            'activities' => $activities,
            'filters' => ['log' => $log, 'search' => $search],
            'logs' => self::LOGS,
        ]);
    }

    private function label(Activity $activity): ?string
    {
        $subject = $activity->subject;

        return $subject?->name ?? $subject?->email ?? $activity->getProperty('name');
    }
}
