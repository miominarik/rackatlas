<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * A page of documentation about a server or a service running on it.
 *
 * @property int $id
 * @property int $team_id
 * @property int|null $server_id
 * @property string $template Key of a template from DocumentTemplates
 * @property string $title
 * @property string|null $subject The service the page is about, as the owner calls it
 * @property DocumentStatus $status
 * @property array<string, string>|null $fields Answers to the structured questions of the template
 * @property array<int, array{title: string, body: string}>|null $sections Free markdown sections
 * @property Carbon|null $reviewed_at
 * @property int|null $created_by
 * @property int|null $updated_by
 */
#[Fillable(['team_id', 'server_id', 'template', 'title', 'subject', 'status', 'fields', 'sections', 'reviewed_at', 'created_by', 'updated_by'])]
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    use LogsActivity;

    protected function casts(): array
    {
        return [
            'status' => DocumentStatus::class,
            'fields' => 'array',
            'sections' => 'array',
            'reviewed_at' => 'date',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('document')
            ->logOnly(['title', 'template', 'status', 'server_id', 'team_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
