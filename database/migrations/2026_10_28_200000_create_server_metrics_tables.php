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
        Schema::table('servers', function (Blueprint $table) {
            $table->string('status')->default('unknown')->after('ssh_key_id');
            $table->timestamp('last_checked_at')->nullable()->after('status');
            $table->timestamp('last_seen_at')->nullable()->after('last_checked_at');
        });

        Schema::create('server_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->timestamp('collected_at');
            $table->decimal('cpu_percent', 5, 2);
            $table->unsignedSmallInteger('cpu_cores');
            $table->decimal('load_1', 8, 2);
            $table->decimal('load_5', 8, 2);
            $table->decimal('load_15', 8, 2);
            $table->unsignedBigInteger('memory_total');
            $table->unsignedBigInteger('memory_used');
            $table->unsignedBigInteger('swap_total')->default(0);
            $table->unsignedBigInteger('swap_used')->default(0);
            $table->unsignedBigInteger('uptime_seconds');

            $table->index(['server_id', 'collected_at']);
            $table->index('collected_at');
        });

        Schema::create('server_metric_disks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_metric_id')->constrained()->cascadeOnDelete();
            $table->string('device');
            $table->string('mount');
            $table->string('filesystem');
            $table->unsignedBigInteger('total_bytes');
            $table->unsignedBigInteger('used_bytes');

            $table->index('server_metric_id');
        });

        Schema::create('server_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->text('message');
            $table->json('context')->nullable();
            $table->timestamp('occurred_at');

            $table->index(['server_id', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_errors');
        Schema::dropIfExists('server_metric_disks');
        Schema::dropIfExists('server_metrics');

        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn(['status', 'last_checked_at', 'last_seen_at']);
        });
    }
};
