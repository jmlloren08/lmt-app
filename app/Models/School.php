<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $fillable = [
        'school',
        'district',
        'ttp',
        'comma',
        'f_v_b',
        'bdo_nb',
        'c_b_s',
        'c_s_v',
        'e_b_i',
        'f_c_b',
        'gsis_cl',
        'gsis_fa',
        'gsis_el',
        'memba',
        'phil_life',
        'plfac',
        'p_b',
        'ucpb',
        'w_b',
        'grand_total',
        'separation',
        'elem_sec'
    ];
}
