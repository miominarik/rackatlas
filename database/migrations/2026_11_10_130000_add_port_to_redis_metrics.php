<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('redis_metrics', function (Blueprint $table) {
            $table->unsignedSmallInteger('port')->nullable()->after('server_id');
            $table->index(['server_id', 'port']);
        });

        // One server can run more Redis instances (agent), so a reading belongs to a port. Readings of servers
        // added as Redis are known by the port of the server. The earlier readings of agents have no port.
        foreach (DB::table('servers')->where('type', 'redis')->get(['id', 'port']) as $server) {
            DB::table('redis_metrics')->where('server_id', $server->id)->update(['port' => $server->port]);
        }

        DB::table('redis_metrics')->whereNull('port')->delete();
    }

    public function down(): void
    {
        Schema::table('redis_metrics', function (Blueprint $table) {
            $table->dropIndex(['server_id', 'port']);
            $table->dropColumn('port');
        });
    }
};
