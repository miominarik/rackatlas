<?php

namespace App\Enums;

enum DocumentStatus: string
{
    /** Still being written, not to be trusted yet. */
    case Draft = 'draft';
    /** Reviewed and matches how things really are. */
    case Current = 'current';
    /** Reality moved on, it needs a new look. */
    case Outdated = 'outdated';
}
