<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\V1\BackupResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BackupController extends ApiController
{
    /**
     * The backups of the team and how their last run went.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return BackupResource::collection(
            $this->team($request)->backups()->with('server:id,name')->orderBy('name')->get(),
        );
    }
}
