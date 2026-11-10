<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Servers that only ran Redis Sentinel have nothing left to monitor.
        DB::table('servers')->where('type', 'sentinel')->delete();

        Schema::table('servers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sentinel_group_id');
            $table->dropColumn('sentinel_port');
        });

        Schema::dropIfExists('sentinel_groups');

        Schema::table('redis_metrics', function (Blueprint $table) {
            $table->dropColumn('sentinel');
            $table->json('cluster')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('redis_metrics', function (Blueprint $table) {
            $table->dropColumn('cluster');
            $table->json('sentinel')->nullable();
        });

        Schema::create('sentinel_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('master_name', 100);
            $table->timestamps();

            $table->unique(['team_id', 'master_name']);
        });

        Schema::table('servers', function (Blueprint $table) {
            $table->unsignedSmallInteger('sentinel_port')->nullable();
            $table->foreignId('sentinel_group_id')->nullable()->constrained('sentinel_groups')->nullOnDelete();
        });
    }
};
