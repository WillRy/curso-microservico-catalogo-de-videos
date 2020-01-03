<?php


namespace App\Models\Traits;

use \Ramsey\Uuid\Uuid as RamseyUuid;

trait Uuid
{

    public static function boot()
    {
        parent::boot();

        /** Evento responsável por atribuir UUID */
        static::creating(function ($obj){
            $obj->incrementing = false;
            $obj->{$obj->getKeyName()} = (string)RamseyUuid::uuid4();
        });
    }
}
