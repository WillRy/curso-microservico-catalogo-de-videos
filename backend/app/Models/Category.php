<?php

namespace App\Models;

use App\ModelFilters\CategoryFilter;
use App\Models\Traits\SerializeDateToIso8601;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use EloquentFilter\Filterable;

class Category extends Model
{

    use SoftDeletes, Uuid, Filterable, SerializeDateToIso8601;

    public $incrementing = false;
    protected $keyType = 'string';

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
        return $this->belongsToMany(Genre::class)->withTrashed();
    }

    public function modelFilter()
    {
        return $this->provideFilter(CategoryFilter::class);
    }

}
