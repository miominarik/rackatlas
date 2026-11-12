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
            $table->boolean('has_docker')->default(false)->after('agent_terminal');
            $table->string('docker_error', 500)->nullable()->after('has_docker');
            $table->timestamp('docker_checked_at')->nullable()->after('docker_error');
        });

        Schema::create('docker_containers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->string('container_id', 64);
            $table->string('name', 255);
            $table->string('image', 500);
            $table->string('state', 20);
            $table->string('status', 255)->nullable();
            $table->string('ports', 1000)->nullable();
            $table->float('cpu_percent')->nullable();
            $table->unsignedBigInteger('memory_bytes')->nullable();
            $table->unsignedBigInteger('memory_limit_bytes')->nullable();
            $table->string('pending_action', 10)->nullable();
            $table->timestamp('action_requested_at')->nullable();
            $table->timestamp('action_sent_at')->nullable();
            $table->string('action_result', 500)->nullable();
            $table->mediumText('logs')->nullable();
            $table->timestamp('logs_updated_at')->nullable();
            $table->timestamp('logs_requested_at')->nullable();
            $table->timestamps();

            $table->unique(['server_id', 'container_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('docker_containers');

        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn(['has_docker', 'docker_error', 'docker_checked_at']);
        });
    }
};
