<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{

    use DatabaseMigrations;

    public function testList()
    {
        factory(Video::class, 3)->create();
        $videos = Video::all();

        $this->assertCount(3, $videos);

        $videoKeys = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id',
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'created_at','updated_at','deleted_at'
        ], $videoKeys);
    }

    public function testUuid()
    {
        $video = factory(Video::class)->create();
        $regex = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/';
        $this->assertTrue((bool) preg_match($regex, $video->id));
        $this->assertNotNull(Video::find($video->id));
    }

    public function testCreate()
    {
        $data = [
            'title' => 'test',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => 'L',
            'duration' => 90,
        ];
        $video = Video::create($data)->refresh();
        $this->assertEquals($video->title, $data['title']);
        $this->assertFalse($video->opened);

        $data['opened'] = true;
        $video = Video::create($data)->refresh();
        $this->assertTrue($video->opened);
    }

    public function testUpdate()
    {
        $video = factory(Video::class)->create();

        $data = [
            'title' => 'title_changed',
            'description' => 'description_changed',
            'year_launched' => 2019,
            'rating' => '10',
            'duration' => 100,
        ];

        $video->update($data);

        foreach ($data as $key => $value){
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class)->create();
        $video->delete();
        $this->assertCount(0, Video::all());
        $this->assertNotNull(Video::withTrashed()->find($video->id));
    }
}
