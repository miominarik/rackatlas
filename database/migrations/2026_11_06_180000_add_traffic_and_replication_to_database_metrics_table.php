<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('database_metrics', function (Blueprint $table) {
            $table->unsignedBigInteger('bytes_received_total')->default(0);
            $table->unsignedBigInteger('bytes_sent_total')->default(0);
            $table->unsignedBigInteger('com_select_total')->default(0);
            $table->unsignedBigInteger('com_insert_total')->default(0);
            $table->unsignedBigInteger('com_update_total')->default(0);
            $table->unsignedBigInteger('com_delete_total')->default(0);
            $table->boolean('replica_io_running')->nullable();
            $table->boolean('replica_sql_running')->nullable();
            $table->unsignedInteger('replica_lag_seconds')->nullable();
            $table->string('replica_source')->nullable();
            $table->string('replica_error', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('database_metrics', function (Blueprint $table) {
            $table->dropColumn([
                'bytes_received_total', 'bytes_sent_total', 'com_select_total', 'com_insert_total',
                'com_update_total', 'com_delete_total', 'replica_io_running', 'replica_sql_running',
                'replica_lag_seconds', 'replica_source', 'replica_error',
            ]);
        });
    }
};
