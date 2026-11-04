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
        Schema::create('backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('server_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 100);
            $table->text('notes')->nullable();
            $table->string('token', 64)->unique();
            $table->unsignedInteger('expected_interval_hours')->nullable();
            $table->timestamp('last_run_at')->nullable();
            $table->string('last_status', 10)->nullable();
            $table->string('last_message', 500)->nullable();
            $table->unsignedBigInteger('last_size_bytes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backups');
    }
};
