<?php

namespace App\Models;

use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use SoftDeletes, Uuid;

    public $incrementing = false;

    protected $fillable = [
        'name',
        'type'
    ];

    protected $casts = [
        'type' => 'integer'
    ];

    protected $dates = ['deleted_at'];
}
