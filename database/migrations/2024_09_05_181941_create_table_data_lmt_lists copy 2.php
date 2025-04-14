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
        Schema::create('data_lmt_lists', function (Blueprint $table) {
            $table->id();
            $table->string('office');
            $table->string('name');
            $table->string('account_status');
            $table->string('renewal_remarks');
            $table->string('school');
            $table->string('district');
            $table->date('gtd')->nullable();
            $table->string('prncpl')->nullable();
            $table->string('tsndng')->nullable();
            $table->string('ntrst')->nullable();
            $table->string('mrtztn')->nullable();
            $table->string('ewrbddctn')->nullable();
            $table->string('nthp')->nullable();
            $table->string('nddctd')->nullable();
            $table->string('dedstat')->nullable();
            $table->string('ntprcd')->nullable();
            $table->string('mntd')->nullable();
            $table->string('client_status');
            $table->string('area');
            $table->string('engagement_status')->nullable();
            $table->string('progress_report')->nullable();
            $table->string('priority_to_engage')->nullable();
            $table->string('action_taken_by')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->date('upload_date')->nullable();
            $table->string('uploaded_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_lmt_lists');
    }
};
