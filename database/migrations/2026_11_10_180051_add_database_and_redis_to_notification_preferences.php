<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->boolean('notify_database')->default(true)->after('notify_logs');
            $table->boolean('notify_redis')->default(true)->after('notify_database');
        });
    }

    public function down(): void
    {
        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->dropColumn(['notify_database', 'notify_redis']);
        });
    }
};
