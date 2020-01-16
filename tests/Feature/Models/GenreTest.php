<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class)->create();
        $genres = Genre::all();
        $this->assertCount(1, $genres);

        $genresKey = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id','name', 'is_active','created_at','updated_at','deleted_at'
        ], $genresKey);
    }

    public function testUuid()
    {
        $genre = factory(Genre::class)->create();

        $regex = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/';
        $this->assertTrue((bool) preg_match($regex, $genre->id));

        $searchGenre = Genre::find($genre->id);
        $this->assertNotNull($searchGenre);
    }

    public function testCreate()
    {
        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->refresh();

        $this->assertEquals('test1', $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => false
        ]);

        $this->assertFalse($genre->is_active);
    }

    public function testUpdate()
    {
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();

        $data = [
            'name' => 'test_name_updated',
            'is_active' => false
        ];

        $genre->update($data);

        foreach ($data as $key => $value){
            $this->assertEquals($value, $genre->{$key});
        }
    }

    public function testDelete()
    {
        $genre = factory(Genre::class)->create();
        $genre->delete();
        $genres = Genre::all();
        $this->assertCount(0, $genres);

        $genre->restore();
        $this->assertNotNull(Genre::find($genre->id));
    }


}
