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
        Schema::create('server_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color')->default('slate');
            $table->timestamps();

            $table->unique(['team_id', 'name']);
        });

        Schema::create('ssh_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('algorithm');
            $table->string('fingerprint');
            $table->text('public_key');
            $table->text('private_key');
            $table->text('passphrase')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'name']);
            $table->unique(['team_id', 'fingerprint']);
        });

        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('server_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('host');
            $table->unsignedSmallInteger('port')->default(22);
            $table->string('username');
            $table->string('auth_type');
            $table->text('password')->nullable();
            $table->foreignId('ssh_key_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->index(['team_id', 'server_category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
        Schema::dropIfExists('ssh_keys');
        Schema::dropIfExists('server_categories');
    }
};
