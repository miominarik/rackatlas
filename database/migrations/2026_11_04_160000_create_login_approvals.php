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
        Schema::table('user_devices', function (Blueprint $table) {
            // This device approves the sign-ins of the account (push notification and a confirmation).
            $table->boolean('approves_logins')->default(false)->after('type');
        });

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->foreignId('user_device_id')->nullable()->after('user_id')->constrained('user_devices')->nullOnDelete();
        });

        Schema::create('login_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('number');
            $table->json('choices');
            $table->string('status', 10)->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->string('browser', 40)->nullable();
            $table->string('platform', 40)->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by_device_id')->nullable()->constrained('user_devices')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_approvals');

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_device_id');
        });

        Schema::table('user_devices', function (Blueprint $table) {
            $table->dropColumn('approves_logins');
        });
    }
};
