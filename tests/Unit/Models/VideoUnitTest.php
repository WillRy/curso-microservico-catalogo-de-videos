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

    public function testRatingListAttribute()
    {
        $rating = ['L', '10', '12', '14', '16', '18'];
        $this->assertEqualsCanonicalizing($rating, Video::RATING_LIST);
    }

    public function testFileFieldsAttribute()
    {
        $fileFields = ['video_file','thumb_file','banner_file','trailer_file'];
        $this->assertEqualsCanonicalizing($fileFields, Video::$fileFields);
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
            'video_file',
            'thumb_file',
            'banner_file',
            'trailer_file'
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

    public function testFilesSizeAttributes()
    {
        $video_file_max_size = 1024 * 1024 * 50; //50GB
        $thumb_file_max_size = 1024 * 5; //5MB
        $banner_file_max_size = 1024 * 10; //10MB
        $trailer_file_max_size = 1024 * 1024 * 1; //1GB

        $this->assertEquals(Video::VIDEO_FILE_MAX_SIZE, $video_file_max_size);
        $this->assertEquals(Video::THUMB_FILE_MAX_SIZE, $thumb_file_max_size);
        $this->assertEquals(Video::BANNER_FILE_MAX_SIZE, $banner_file_max_size);
        $this->assertEquals(Video::TRAILER_FILE_MAX_SIZE, $trailer_file_max_size);
    }
}
