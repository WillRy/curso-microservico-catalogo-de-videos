<?php

namespace Tests\Unit\Models;

use App\Models\Traits\UploadFiles;
use App\Models\Traits\Uuid;
use App\Models\Video;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class VideoUnitTest extends TestCase
{

    private $video;

    public function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testRatingList()
    {
        $rating = ['L', '10', '12', '14', '16', '18'];
        $this->assertEqualsCanonicalizing($rating, Video::RATING_LIST);
    }

    public function testFillableAttribute()
    {
        $fillable = [
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file'
        ];

        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class, UploadFiles::class];
        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEquals($traits, $videoTraits);
    }

    public function testCastsAttribute()
    {
        $casts = [
            'id' => 'string',
            'opened' => 'boolean',
            'year_launched' => 'integer',
            'duration' => 'integer'
        ];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testDatesAttribute()
    {
        $dates = ['created_at', 'updated_at', 'deleted_at'];
        $this->assertEqualsCanonicalizing($dates, $this->video->getDates());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->video->incrementing);
    }
}
