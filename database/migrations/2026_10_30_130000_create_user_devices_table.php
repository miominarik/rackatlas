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
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->string('name', 100)->nullable();
            $table->string('browser', 40)->nullable();
            $table->string('platform', 40)->nullable();
            $table->string('type', 10)->default('desktop');
            $table->string('ip_address', 45)->nullable();
            $table->string('session_id', 100)->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'revoked_at']);
        });

        // The dashboard layout belongs to a device. Rows without a device are the old, account wide
        // layouts: a device that has not saved its own layout yet starts from them.
        Schema::table('dashboard_preferences', function (Blueprint $table) {
            $table->foreignId('device_id')->nullable()->after('team_id')->constrained('user_devices')->cascadeOnDelete();
            $table->unique(['user_id', 'team_id', 'device_id']);
        });

        Schema::table('dashboard_preferences', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'team_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dashboard_preferences', function (Blueprint $table) {
            $table->dropConstrainedForeignId('device_id');
        });

        Schema::table('dashboard_preferences', function (Blueprint $table) {
            $table->unique(['user_id', 'team_id']);
        });

        Schema::dropIfExists('user_devices');
    }
};
