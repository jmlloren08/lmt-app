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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('school');
            $table->string('district');
            $table->unsignedBigInteger('ttp')->nullable();
            $table->unsignedBigInteger('comma')->nullable();
            $table->unsignedBigInteger('f_v_b')->nullable();
            $table->unsignedBigInteger('bdo_nb')->nullable();
            $table->unsignedBigInteger('c_b_s')->nullable();
            $table->unsignedBigInteger('c_s_v')->nullable();
            $table->unsignedBigInteger('e_b_i')->nullable();
            $table->unsignedBigInteger('f_c_b')->nullable();
            $table->unsignedBigInteger('gsis_cl')->nullable();
            $table->unsignedBigInteger('gsis_fa')->nullable();
            $table->unsignedBigInteger('gsis_el')->nullable();
            $table->unsignedBigInteger('memba')->nullable();
            $table->unsignedBigInteger('phil_life')->nullable();
            $table->unsignedBigInteger('plfac')->nullable();
            $table->unsignedBigInteger('p_b')->nullable();
            $table->unsignedBigInteger('ucpb')->nullable();
            $table->unsignedBigInteger('w_b')->nullable();
            $table->unsignedBigInteger('grand_total')->nullable();
            $table->unsignedBigInteger('separation')->nullable();
            $table->string('elem_sec')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
