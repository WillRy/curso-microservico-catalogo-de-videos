<?php


namespace Tests\Feature\Http\Controllers\Api\Video;


use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;

abstract class BaseVideoControllerTestCase extends TestCase
{

    use DatabaseMigrations;

    /** @var Video  */
    protected $video;
    protected $sendData;
    protected $category;
    protected $genre;

    public function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false
        ]);

        $this->category = factory(Category::class)->create();
        $this->genre = factory(Genre::class)->create();
        $this->genre->categories()->sync($this->category->id);

        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
            'categories_id' => [$this->category->id],
            'genres_id' => [$this->genre->id]
        ];
    }

    protected function assertIfFilesUrlExists(Video $video, TestResponse $response)
    {
        $fileFields = Video::$fileFields;
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach ($fileFields as $field){
            $file = $video->{$field};

            if($file == null){
                $this->assertNull($data[$field.'_url']);
            } else {
                $this->assertEquals(
                    \Storage::url($video->relativeFilePath($file)),
                    $data[$field.'_url']);
            }
        }
    }
}
