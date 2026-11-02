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
        // Laravel Pulse was removed, so its tables go too.
        Schema::dropIfExists('pulse_values');
        Schema::dropIfExists('pulse_entries');
        Schema::dropIfExists('pulse_aggregates');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The feature is gone, there is nothing to bring back.
    }
};
