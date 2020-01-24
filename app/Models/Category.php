<?php

namespace App\Models;

use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Category extends Model
{

    use SoftDeletes, Uuid;

    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];

    protected $dates = ['deleted_at'];

    /** @var array força cast para exibir models, ao usar toArray*/
    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean'
    ];

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }


}
