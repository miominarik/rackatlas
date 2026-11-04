<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('backups', function (Blueprint $table) {
            // A paused backup is not judged, not notified and not shown on the dashboard.
            $table->boolean('is_active')->default(true)->after('notes');
            // When it was switched on again: the expected interval starts counting from then.
            $table->timestamp('resumed_at')->nullable()->after('last_size_bytes');
            // When the team was told it is overdue; cleared by the next run.
            $table->timestamp('alerted_at')->nullable()->after('resumed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('backups', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'resumed_at', 'alerted_at']);
        });
    }
};
