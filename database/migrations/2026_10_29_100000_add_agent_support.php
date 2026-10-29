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
            // A server that reports through the agent has no address to connect to.
            $table->string('host')->nullable()->change();
            $table->string('username')->nullable()->change();

            $table->string('agent_token_hash', 64)->nullable()->unique()->after('ssh_key_id');
            $table->string('agent_version', 32)->nullable()->after('agent_token_hash');
            $table->json('failed_units')->nullable()->after('agent_version');
        });

        Schema::create('server_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->string('level', 16);
            $table->string('source');
            $table->text('message');
            $table->unsignedInteger('count')->default(1);
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
        Schema::dropIfExists('server_logs');

        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn(['agent_token_hash', 'agent_version', 'failed_units']);
        });
    }
};
