<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;
    
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

    protected $casts = [
        'ttp' => 'integer',
        'comma' => 'integer',
        'f_v_b' => 'integer',
        'bdo_nb' => 'integer',
        'c_b_s' => 'integer',
        'c_s_v' => 'integer',
        'e_b_i' => 'integer',
        'f_c_b' => 'integer',
        'gsis_cl' => 'integer',
        'gsis_fa' => 'integer',
        'gsis_el' => 'integer',
        'memba' => 'integer',
        'phil_life' => 'integer',
        'plfac' => 'integer',
        'p_b' => 'integer',
        'ucpb' => 'integer',
        'w_b' => 'integer',
        'grand_total' => 'integer',
        'separation' => 'integer'
    ];
    
} 