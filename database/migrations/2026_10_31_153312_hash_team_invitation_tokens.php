<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Invitation tokens are stored as SHA-256 hashes. Links already sent keep working because the
     * link carries the plain token, which is hashed before the lookup.
     */
    public function up(): void
    {
        DB::table('team_invitations')->orderBy('id')->each(function ($invitation) {
            if (! preg_match('/^[a-f0-9]{64}$/', $invitation->token)) {
                DB::table('team_invitations')->where('id', $invitation->id)
                    ->update(['token' => hash('sha256', $invitation->token)]);
            }
        });
    }

    /** The plain tokens cannot be restored. Pending invitations have to be sent again. */
    public function down(): void
    {
        DB::table('team_invitations')->delete();
    }
};
