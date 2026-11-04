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
        // Sign-in through other services was removed, so its table goes too.
        Schema::dropIfExists('social_accounts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The feature is gone, there is nothing to bring back.
    }
};
