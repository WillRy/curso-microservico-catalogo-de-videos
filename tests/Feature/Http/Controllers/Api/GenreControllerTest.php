<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Http\Resources\GenreResource;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{

    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    protected $genre;
    protected $serializedFields = [
        'id',
        'name',
        'is_active',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
        $this->genre->refresh();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));
        $response
            ->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->serializedFields
                ],
                'links' => [],
                'meta' => []
            ]);

        $resource = GenreResource::collection(collect([$this->genre]));
        $this->assertResource($response, $resource);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);

        $resource = $this->getResource($response, $this->model());
        $this->assertResource($response, $resource);
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
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

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


        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }


    public function testSave()
    {
        $categoryId = factory(Category::class)->create()->id;

        $data = [
            [
                'send_data' => ['name' => 'test', 'categories_id' => [$categoryId]],
                'test_data' => ['name' => 'test']
            ],
            [
                'send_data' => ['name' => 'test', 'is_active' => false, 'categories_id' => [$categoryId]],
                'test_data' => ['name' => 'test', 'is_active' => false]
            ]
        ];

        foreach ($data as $key => $value){
            $response = $this->assertStore($value['send_data'], $value['test_data']);
            $response
                ->assertJsonStructure([
                    'data' => $this->serializedFields
                ]);
            $resource = $this->getResource($response, $this->model());
            $this->assertResource($response, $resource);
            $this->assertHasCategory($response->json('data.id'), $categoryId);


            $response = $this->assertUpdate($value['send_data'], $value['test_data']);
            $response
                ->assertJsonStructure([
                    'data' => $this->serializedFields
                ]);
            $resource = $this->getResource($response, $this->model());
            $this->assertResource($response, $resource);
            $this->assertHasCategory($response->json('data.id'), $categoryId);
        }

    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];

        $response = $this->json('POST', $this->routeStore(), $sendData);

        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $response->json('data.id'),
            'category_id' => $categoriesId[0]
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];

        $response = $this->json('PUT', route('genres.update', ['genre' => $response->json('data.id')]), $sendData);
        $this->assertDatabaseMissing('category_genre', [
            'genre_id' => $response->json('id'),
            'category_id' => $categoriesId[0]
        ]);

        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $response->json('data.id'),
            'category_id' => $categoriesId[1]
        ]);

        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $response->json('data.id'),
            'category_id' => $categoriesId[2]
        ]);

    }

    public function assertHasCategory($genreId, $categoryId)
    {
        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $genreId,
            'category_id' => $categoryId
        ]);
    }

    public function testRollbackStore()
    {
        $controller = \Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $controller->shouldReceive('validate')->withAnyArgs()->andReturn(['name' => 'test']);
        $controller->shouldReceive('rulesStore')->withAnyArgs()->andReturn([]);
        $controller->shouldReceive('handleRelations')->once()->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);


        /** garantir que a exception foi capturada e executou o catch */
        $hasError = false;
        try {
            $controller->store($request);
        }catch (TestException $e){
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $controller = \Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $controller->shouldReceive('validate')->withAnyArgs()->andReturn(['genre' => 'test']);
        $controller->shouldReceive('rulesUpdate')->withAnyArgs()->andReturn([]);
        $controller->shouldReceive('handleRelations')->once()->andThrow(new TestException());
        $controller->shouldReceive('findOrFail')->withAnyArgs()->andReturn($this->genre);

        $request = \Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->update($request, $this->genre->id);
        } catch (TestException $e){
            $this->assertEquals($this->genre->toArray(), Genre::find($this->genre->id)->toArray());
            $hasError = true;
        }
        $this->assertTrue($hasError);
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

    function resource()
    {
        return GenreResource::class;
    }
}
