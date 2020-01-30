<?php


namespace Tests\Feature\Models\Video;


use App\Models\Video;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Http\UploadedFile;
use Tests\Exceptions\TestException;

class VideoUploadTest extends BaseVideoTestCase
{
    public function testCreateWithFiles()
    {
        \Storage::fake();
        $video = Video::create(
            $this->data +
            [
                'video_file' => UploadedFile::fake()->create('video_file.mp4'),
                'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                'banner_file' => UploadedFile::fake()->image('banner.jpg'),
                'trailer_file' => UploadedFile::fake()->create('video_file.mp4')
            ]
        );

        \Storage::assertExists("{$video->id}/{$video->video_file}");
        \Storage::assertExists("{$video->id}/{$video->thumb_file}");
        \Storage::assertExists("{$video->id}/{$video->banner_file}");
        \Storage::assertExists("{$video->id}/{$video->trailer_file}");
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $video = factory(Video::class)->create();

        $videoFile = UploadedFile::fake()->create('video.mp4');
        $thumbFile  = UploadedFile::fake()->image('thumb.jpg');
        $bannerFile  = UploadedFile::fake()->image('banner.jpg');
        $trailerFile = UploadedFile::fake()->create('trailer.mp4');

        $video->update($this->data + [
                'video_file' => $videoFile,
                'thumb_file' => $thumbFile,
                'banner_file' => $bannerFile,
                'trailer_file' => $trailerFile
            ]);

        \Storage::assertExists("{$video->id}/{$video->video_file}");
        \Storage::assertExists("{$video->id}/{$video->thumb_file}");
        \Storage::assertExists("{$video->id}/{$video->banner_file}");
        \Storage::assertExists("{$video->id}/{$video->trailer_file}");

        $newVideoFile = UploadedFile::fake()->create('video.mp4');
        $video->update($this->data + [
                'video_file' => $newVideoFile
            ]);
        \Storage::assertMissing("{$video->id}/{$videoFile->hashName()}");
        \Storage::assertExists("{$video->id}/{$newVideoFile->hashName()}");
        \Storage::assertExists("{$video->id}/{$thumbFile->hashName()}");
        \Storage::assertExists("{$video->id}/{$bannerFile->hashName()}");
        \Storage::assertExists("{$video->id}/{$trailerFile->hashName()}");

    }


    public function testCreateIfRollbackFiles()
    {
        \Storage::fake();

        \Event::listen(TransactionCommitted::class, function (){
            throw new TestException();
        });

        $hasError = false;

        try {
            $video = Video::create(
                $this->data + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'banner_file' => UploadedFile::fake()->image('banner.jpg'),
                    'trailer_file' => UploadedFile::fake()->create('video_file.mp4'),
                    'video_file' => UploadedFile::fake()->create('video_file.mp4')
                ]
            );
        } catch (\Exception $e) {
            $hasError = true;
            $this->assertCount(0, \Storage::allFiles());
        }

        $this->assertTrue($hasError);
    }


    public function testUpdateIfRollbackFiles()
    {
        \Storage::fake();

        $video = factory(Video::class)->create();

        \Event::listen(TransactionCommitted::class, function (){
            throw new TestException();
        });

        $hasError = false;

        try {
            $video->update($this->data + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'banner_file' => UploadedFile::fake()->image('banner.jpg'),
                    'trailer_file' => UploadedFile::fake()->create('trailer_file.mp4'),
                    'video_file' => UploadedFile::fake()->create('video_file.mp4')
                ]
            );

        } catch (\Exception $e) {
            $hasError = true;
            $this->assertCount(0, \Storage::allFiles());
        }

        $this->assertTrue($hasError);
    }

    public function testUrlWithLocalDriver()
    {

        \Config::set('filesystems.default','video_local');

        /** @var Video $video */
        $video = factory(Video::class)->create($this->fileFieldsData);

        $storagePath = config('filesystems.disks.video_local.url');

        foreach (Video::$fileFields as $field){
            $fullPath = "{$storagePath}/{$video->id}/{$video->{$field}}";
            $modelUrl =  "{$video->{"{$field}_url"}}";
            $this->assertEquals($fullPath, $modelUrl);
        }

    }

    public function testUrlWithGCSDriver()
    {
        /**
         * Marcada como skipped por estar sem conta no GCS e o driver
         * exige a autenticacao com o arquivo json
         */
        $this->markTestSkipped();
        \Config::set('filesystems.default','gcs');

        /** @var Video $video */
        $video = factory(Video::class)->create($this->fileFieldsData);

        $storagePath = config('filesystems.disks.gcs.storage_api_uri');

        foreach (Video::$fileFields as $field){
            $fullPath = "{$storagePath}/{$video->id}/{$video->{$field}}";
            $modelUrl =  "{$video->{"{$field}_url"}}";
            $this->assertEquals($fullPath, $modelUrl);
        }

    }

    public function testUrlWithNullFile()
    {
        \Config::set('filesystems.default','video_local');

        /** @var Video $video */
        $video = factory(Video::class)->create();

        $storagePath = config('filesystems.disks.video_local.url');

        foreach (Video::$fileFields as $field){
            $this->assertNull($video->{"{$field}_url"});
        }
    }
}
