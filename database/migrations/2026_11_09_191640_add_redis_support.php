<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Redis servers and Sentinel-only servers that run in one Redis Sentinel setup watch the same master.
        Schema::create('sentinel_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('master_name', 100);
            $table->timestamps();

            $table->unique(['team_id', 'master_name']);
        });

        Schema::table('servers', function (Blueprint $table) {
            $table->foreignId('sentinel_group_id')->nullable()->after('ssh_key_id')->constrained('sentinel_groups')->nullOnDelete();
            $table->unsignedSmallInteger('sentinel_port')->nullable()->after('sentinel_group_id');
        });

        Schema::create('redis_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->timestamp('collected_at');
            $table->string('version', 50)->nullable();
            $table->string('role', 20)->nullable();
            $table->unsignedBigInteger('uptime_seconds')->default(0);
            $table->unsignedInteger('connected_clients')->default(0);
            $table->unsignedInteger('blocked_clients')->default(0);
            $table->unsignedInteger('max_clients')->default(0);
            $table->unsignedBigInteger('used_memory')->default(0);
            $table->unsignedBigInteger('max_memory')->default(0);
            $table->unsignedBigInteger('used_memory_rss')->default(0);
            $table->unsignedBigInteger('commands_total')->default(0);
            $table->decimal('commands_per_second', 10, 2)->nullable();
            $table->unsignedBigInteger('keyspace_hits_total')->default(0);
            $table->unsignedBigInteger('keyspace_misses_total')->default(0);
            $table->unsignedBigInteger('evicted_keys_total')->default(0);
            $table->unsignedBigInteger('rejected_connections_total')->default(0);
            $table->unsignedBigInteger('keys_count')->default(0);
            $table->unsignedInteger('connected_replicas')->default(0);
            $table->string('master_host')->nullable();
            $table->string('master_link_status', 20)->nullable();
            $table->integer('master_last_io_seconds_ago')->nullable();
            $table->boolean('persistence_ok')->nullable();
            $table->json('sentinel')->nullable();

            $table->index(['server_id', 'collected_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redis_metrics');

        Schema::table('servers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sentinel_group_id');
            $table->dropColumn('sentinel_port');
        });

        Schema::dropIfExists('sentinel_groups');
    }
};
