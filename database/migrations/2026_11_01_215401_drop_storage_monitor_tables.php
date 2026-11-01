<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The Azure storage monitoring was removed, so its tables go too (checks first, they reference monitors).
        Schema::dropIfExists('storage_checks');
        Schema::dropIfExists('storage_monitors');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The feature is gone, there is nothing to bring back.
    }
};
