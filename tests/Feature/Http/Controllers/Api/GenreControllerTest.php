<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{

    use DatabaseMigrations, TestValidations, TestSaves;

    protected $genre;

    public function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));
        $response
            ->assertStatus(200)
            ->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));
        $response
            ->assertStatus(200)
            ->assertJson($this->genre->toArray());

    }

    public function testInvalidationData()
    {

        $data = [
            'name' => ''
        ];
        $this->assertInvalidationInStoreAction($data,'required');
        $this->assertInvalidationInUpdateAction($data,'required');


        $data = [
            'name' => str_repeat('a',256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);


        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');

    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testSave()
    {
        $category = factory(Category::class)->create();

        $data = [
            [
                'send_data' => ['name' => 'test', 'categories_id' => [$category->id]],
                'test_data' => ['name' => 'test']
            ],
            [
                'send_data' => ['name' => 'test', 'is_active' => false, 'categories_id' => [$category->id]],
                'test_data' => ['name' => 'test', 'is_active' => false]
            ]
        ];

        foreach ($data as $key => $value){
            $response = $this->assertStore($value['send_data'], $value['test_data']);
            $response
                ->assertJsonStructure([
                    'created_at', 'updated_at'
                ]);
            $this->assertRelationsCategory($response->json('id'), $category->id);


            $response = $this->assertUpdate($value['send_data'], $value['test_data']);
            $response
                ->assertJsonStructure([
                    'created_at', 'updated_at'
                ]);
            $this->assertRelationsCategory($response->json('id'), $category->id);
        }

    }


    public function assertRelationsCategory($genreId, $categoryId)
    {
        $genre = Genre::find($genreId);
        $this->assertNotNull($genre->categories()->find($categoryId));
    }

    public function testDestroy()
    {
        $response = $this->delete(route('genres.destroy', ['genre' => $this->genre->id]));
        $response
            ->assertStatus(204)
            ->assertNoContent();
        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }


    protected function routeStore()
    {
        return route('genres.store');
    }

    protected function routeUpdate()
    {
        return route('genres.update', ['genre' => $this->genre->id]);
    }

    protected function model()
    {
        return Genre::class;
    }
}
