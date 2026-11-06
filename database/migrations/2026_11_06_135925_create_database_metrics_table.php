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
        Schema::create('database_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->timestamp('collected_at');
            $table->string('version', 100)->nullable();
            $table->unsignedBigInteger('uptime_seconds')->default(0);
            $table->unsignedInteger('threads_connected')->default(0);
            $table->unsignedInteger('threads_running')->default(0);
            $table->unsignedInteger('max_connections')->default(0);
            $table->unsignedBigInteger('questions_total')->default(0);
            $table->decimal('queries_per_second', 10, 2)->nullable();
            $table->unsignedBigInteger('slow_queries_total')->default(0);
            $table->unsignedBigInteger('aborted_connects_total')->default(0);
            $table->unsignedBigInteger('buffer_pool_size')->nullable();
            $table->unsignedBigInteger('data_bytes')->default(0);
            $table->unsignedInteger('databases_count')->default(0);

            $table->index(['server_id', 'collected_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('database_metrics');
    }
};
