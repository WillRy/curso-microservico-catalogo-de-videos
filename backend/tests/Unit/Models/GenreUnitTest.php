<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class GenreUnitTest extends TestCase
{
    private $genre;

    public function setUp(): void
    {
        parent::setUp();
        $this->genre = new Genre();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'is_active'];
        $this->assertEquals($fillable, $this->genre->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Uuid::class,
            Filterable::class
        ];
        $genreTraits = array_keys(class_uses(Genre::class));
        $this->assertEquals($traits, $genreTraits);
    }

    public function testCastsAttribute()
    {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];
        $this->assertEquals($casts, $this->genre->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->genre->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['created_at','updated_at', 'deleted_at'];
        $this->assertEqualsCanonicalizing($dates, $this->genre->getDates());
    }
}
