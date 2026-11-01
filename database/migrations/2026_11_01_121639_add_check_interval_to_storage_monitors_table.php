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
        Schema::table('storage_monitors', function (Blueprint $table) {
            $table->unsignedSmallInteger('check_interval')->default(5)->after('sas_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storage_monitors', function (Blueprint $table) {
            $table->dropColumn('check_interval');
        });
    }
};
