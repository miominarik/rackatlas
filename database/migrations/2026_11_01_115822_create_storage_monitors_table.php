<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_monitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('account', 24);
            $table->string('container', 63);
            $table->text('sas_token');
            $table->string('status')->default('unknown');
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('last_ok_at')->nullable();
            $table->string('last_error')->nullable();
            $table->unsignedSmallInteger('failures')->default(0);
            $table->timestamp('alert_opened_at')->nullable();
            $table->unsignedBigInteger('blob_count')->nullable();
            $table->unsignedBigInteger('total_bytes')->nullable();
            $table->boolean('is_partial')->default(false);
            $table->unsignedInteger('response_ms')->nullable();
            $table->timestamps();

            $table->index('team_id');
        });

        Schema::create('storage_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storage_monitor_id')->constrained()->cascadeOnDelete();
            $table->timestamp('checked_at');
            $table->boolean('ok');
            $table->unsignedInteger('response_ms')->nullable();
            $table->unsignedBigInteger('blob_count')->nullable();
            $table->unsignedBigInteger('total_bytes')->nullable();
            $table->string('error')->nullable();

            $table->index(['storage_monitor_id', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_checks');
        Schema::dropIfExists('storage_monitors');
    }
};
