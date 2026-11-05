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
        Schema::create('server_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->string('unit', 150);
            $table->string('description', 255)->nullable();
            $table->string('active_state', 20);
            $table->string('sub_state', 30)->nullable();
            $table->string('unit_file_state', 30)->nullable();
            $table->mediumText('journal')->nullable();
            $table->timestamp('journal_updated_at')->nullable();
            $table->timestamp('journal_requested_at')->nullable();
            $table->timestamps();

            $table->unique(['server_id', 'unit']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_services');
    }
};
