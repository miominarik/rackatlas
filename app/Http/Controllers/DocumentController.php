<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\Server;
use App\Models\Team;
use App\Support\DocumentTemplates;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        $documents = $team
            ? $team->documents()->with('server:id,name', 'editor:id,name')->latest('updated_at')->get()
            : collect();
        $servers = $team ? $team->machines()->orderBy('name')->get(['id', 'name']) : collect();
        $documented = $documents->pluck('server_id')->filter()->unique();

        return Inertia::render('documents/index', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $this->canManage($request, $team),
            'templates' => $this->templates(),
            'servers' => $servers->map(fn (Server $server) => [
                'id' => $server->id,
                'name' => $server->name,
                'documents' => $documents->where('server_id', $server->id)->count(),
                'documented' => $documented->contains($server->id),
            ])->values(),
            'documents' => $documents->map(fn (Document $document) => $this->present($document))->values(),
        ]);
    }

    public function create(Request $request): Response
    {
        $team = $request->user()->currentTeam();
        abort_if($team === null, 404);

        return Inertia::render('documents/form', [
            'document' => null,
            'templates' => $this->templates(),
            'template' => (string) $request->query('template', ''),
            'serverId' => $request->integer('server') ?: null,
            'servers' => $this->serverOptions($team),
        ]);
    }

    public function store(DocumentRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam();

        $document = $team->documents()->create([
            ...$this->attributes($request),
            'template' => $request->validated('template'),
            'created_by' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document created.')]);

        return to_route('documents.show', $document);
    }

    public function show(Document $document): Response
    {
        $this->authorize('permit', [$document->team, 'docs.view']);

        $document->load('server:id,name', 'creator:id,name', 'editor:id,name');

        return Inertia::render('documents/show', [
            'document' => $this->present($document, true),
            'template' => $this->templates()[$document->template] ?? null,
            'canManage' => request()->user()->can('permit', [$document->team, 'docs.edit']),
        ]);
    }

    public function edit(Document $document): Response
    {
        $this->authorize('permit', [$document->team, 'docs.edit']);

        $document->load('server:id,name');

        return Inertia::render('documents/form', [
            'document' => $this->present($document, true),
            'templates' => $this->templates(),
            'template' => $document->template,
            'serverId' => $document->server_id,
            'servers' => $this->serverOptions($document->team),
        ]);
    }

    public function update(DocumentRequest $request, Document $document): RedirectResponse
    {
        $document->fill($this->attributes($request, $document->template))->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document saved.')]);

        return to_route('documents.show', $document);
    }

    /**
     * Confirm that the page matches reality today.
     */
    public function review(Request $request, Document $document): RedirectResponse
    {
        $this->authorize('permit', [$document->team, 'docs.edit']);

        $document->forceFill([
            'status' => DocumentStatus::Current,
            'reviewed_at' => now()->toDateString(),
            'updated_by' => $request->user()->id,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Marked as reviewed.')]);

        return back();
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->authorize('permit', [$document->team, 'docs.edit']);

        $document->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document deleted.')]);

        return to_route('documents.index');
    }

    private function canManage(Request $request, ?Team $team): bool
    {
        return $team !== null && $request->user()->can('permit', [$team, 'docs.edit']);
    }

    /**
     * Only the answers the template asks for, and no empty ones.
     *
     * @return array<string, mixed>
     */
    private function attributes(DocumentRequest $request, ?string $template = null): array
    {
        $template ??= $request->validated('template');
        $fields = array_filter(
            array_intersect_key($request->validated('fields') ?? [], array_flip(DocumentTemplates::fieldKeys($template))),
            fn ($value) => filled($value),
        );

        return [
            'title' => $request->validated('title'),
            'subject' => $request->validated('subject'),
            'status' => $request->validated('status'),
            'server_id' => $request->validated('server_id'),
            'reviewed_at' => $request->validated('reviewed_at'),
            'fields' => $fields,
            'sections' => array_values(array_map(fn (array $section) => [
                'title' => $section['title'],
                'body' => (string) ($section['body'] ?? ''),
            ], $request->validated('sections') ?? [])),
            'updated_by' => $request->user()->id,
        ];
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function serverOptions(Team $team): array
    {
        return $team->machines()->orderBy('name')->get(['id', 'name'])->map->only('id', 'name')->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function templates(): array
    {
        return DocumentTemplates::all();
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Document $document, bool $full = false): array
    {
        $data = [
            'id' => $document->id,
            'title' => $document->title,
            'subject' => $document->subject,
            'template' => $document->template,
            'status' => $document->status->value,
            'server_id' => $document->server_id,
            'server_name' => $document->server?->name,
            'reviewed_at' => $document->reviewed_at?->toDateString(),
            'updated_at' => $document->updated_at?->toIso8601String(),
            'updated_by' => $document->editor?->name,
        ];

        if (! $full) {
            return $data;
        }

        return [
            ...$data,
            'fields' => $document->fields ?? [],
            'sections' => $document->sections ?? [],
            'created_at' => $document->created_at?->toIso8601String(),
            'created_by' => $document->creator?->name,
        ];
    }
}
