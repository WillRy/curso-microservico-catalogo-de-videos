<?php

namespace App\ModelFilters;

use App\Models\CastMember;

class CastMemberFilter extends DefaultModelFilter
{

    public $relations = [];

    protected $sortable = ['name', 'type', 'created_at'];

    public function search($search)
    {
        $this->where('name', 'like', "%$search%");
    }

    public function type($type)
    {
        $type_ = (int)$type;
        if (in_array($type_, CastMember::$types)) {
            $this->where('type', '=', $type_);
        }
    }

}
