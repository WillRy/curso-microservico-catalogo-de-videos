<?php


namespace Tests\Feature\Http\Controllers\Api\Video;


use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Support\Arr;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerCrudTest extends BaseVideoControllerTestCase
{

    use TestSaves, TestValidations, TestResources;

    protected $serializedFields = [
        'title',
        'description',
        'year_launched',
        'rating',
        'duration',
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
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'categories_id',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    public function testIndex()
    {
        $response = $this->json('GET', route('videos.index'));
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


        $resource = VideoResource::collection(collect([$this->video]));
        $this->assertResource($response, $resource);
    }

    public function testShow()
    {
        $response = $this->json('GET', route('videos.show', ['video' => $this->video->id]));
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);

        $resource = $this->getResource($response, $this->model());
        $this->assertResource($response, $resource);
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => ''
        ];

        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = [
            'title' => str_repeat('a', 256)
        ];

        $this->assertInvalidationInStoreAction($data,'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data,'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger()
    {
        $data = [
            'duration' => 's'
        ];
        $this->assertInvalidationInStoreAction($data,'integer');
        $this->assertInvalidationInUpdateAction($data,'integer');

    }

    public function testInvalidationYearLaunchedField()
    {
        $data = [
            'year_launched' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField()
    {
        $data = [
            'opened' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');

    }

    public function testInvalidationRatingField()
    {
        $data = [
            'rating' => 0
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
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

        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationGenresIdField()
    {
        $data = [
            'genres_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [100]
        ];

        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();
        $genre->delete();
        $data = [
            'genres_id' => [$genre->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

    }

    public function testSaveWithoutFiles()
    {

        $testData = Arr::except($this->sendData, ['categories_id', 'genres_id']);
        $serializedData = Arr::except($this->serializedFields, ['categories', 'genres']);

        $data = [
            [
                'send_data' => $this->sendData,
                'test_data' => $testData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + ['opened' => true],
                'test_data' => $testData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData +['rating' => Video::RATING_LIST[1]],
                'test_data' => $testData + ['rating' => Video::RATING_LIST[1]]
            ]
        ];

        foreach ($data as $key => $value){
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response
                ->assertJsonStructure([
                    'data' => $serializedData
                ]);
            $resource = $this->getResource($response, $this->model());
            $this->assertResource($response, $resource);

            $this->assertHasCategory($response->json('data.id'), $this->category->id);
            $this->assertHasGenre($response->json('data.id'), $this->genre->id);

            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response
                ->assertJsonStructure([
                    'data' => $serializedData
                ]);
            $resource = $this->getResource($response, $this->model());
            $this->assertResource($response, $resource);


            $this->assertHasCategory($response->json('data.id'), $this->category->id);
            $this->assertHasGenre($response->json('data.id'), $this->genre->id);

        }

    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }

    public function testDestroy()
    {
        $response = $this->json('DELETE', route('videos.destroy', ['video' => $this->video->id]));
        $response
            ->assertStatus(204)
            ->assertNoContent();

        $this->assertNull(Video::find($this->video->id));
        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
    }


    protected function model()
    {
        return Video::class;
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }

    function resource()
    {
        return VideoResource::class;
    }
}
