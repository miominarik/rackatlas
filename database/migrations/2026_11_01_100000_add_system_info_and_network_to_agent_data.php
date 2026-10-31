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
            $table->json('system_info')->nullable()->after('failed_units');
        });

        Schema::table('server_metrics', function (Blueprint $table) {
            $table->unsignedBigInteger('net_rx_bps')->nullable()->after('uptime_seconds');
            $table->unsignedBigInteger('net_tx_bps')->nullable()->after('net_rx_bps');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn('system_info');
        });

        Schema::table('server_metrics', function (Blueprint $table) {
            $table->dropColumn(['net_rx_bps', 'net_tx_bps']);
        });
    }
};
