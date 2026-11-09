<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sentinel_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('master_name', 100);
            $table->timestamps();

            $table->unique(['team_id', 'master_name']);
        });

        Schema::table('servers', function (Blueprint $table) {
            $table->foreignId('sentinel_group_id')->nullable()->after('ssh_key_id')->constrained('sentinel_groups')->nullOnDelete();
        });

        // Servers that were linked as a pair have the same master name, so they end up in one group.
        foreach (DB::table('servers')->whereNotNull('sentinel_master_name')->get(['id', 'team_id', 'sentinel_master_name']) as $server) {
            $group = DB::table('sentinel_groups')
                ->where('team_id', $server->team_id)
                ->where('master_name', $server->sentinel_master_name)
                ->value('id') ?? DB::table('sentinel_groups')->insertGetId([
                    'team_id' => $server->team_id,
                    'master_name' => $server->sentinel_master_name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            DB::table('servers')->where('id', $server->id)->update(['sentinel_group_id' => $group]);
        }

        Schema::table('servers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sentinel_peer_id');
            $table->dropColumn('sentinel_master_name');
        });
    }

    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->foreignId('sentinel_peer_id')->nullable()->after('ssh_key_id')->constrained('servers')->nullOnDelete();
            $table->string('sentinel_master_name', 100)->nullable()->after('sentinel_port');
        });

        foreach (DB::table('sentinel_groups')->get() as $group) {
            DB::table('servers')->where('sentinel_group_id', $group->id)->update(['sentinel_master_name' => $group->master_name]);
        }

        Schema::table('servers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sentinel_group_id');
        });

        Schema::dropIfExists('sentinel_groups');
    }
};
