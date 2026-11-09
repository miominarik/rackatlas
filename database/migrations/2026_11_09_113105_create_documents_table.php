<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('server_id')->nullable()->constrained()->nullOnDelete();
            $table->string('template', 30);
            $table->string('title', 150);
            $table->string('subject', 100)->nullable();
            $table->string('status', 20)->default('draft');
            $table->json('fields')->nullable();
            $table->json('sections')->nullable();
            $table->date('reviewed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['team_id', 'server_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
