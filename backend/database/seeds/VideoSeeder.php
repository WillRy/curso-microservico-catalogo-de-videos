<?php

use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    private $allGenres = [];
    private $allCastMembers = [];
    private $relations = [
        'categories_id' => [],
        'genres_id' => [],
        'cast_members_id' => []
    ];
    public function run()
    {

        $dir = \Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);

        $self = $this;

        $this->allGenres = \App\Models\Genre::all();
        $this->allCastMembers = \App\Models\CastMember::all();

        //permite o mass assigment
        Model::reguard();

        factory(Video::class, 50)
            ->make()
            ->each(function (Video $video) use ($self) {
                $self->fetchRelations();

                Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'thumb_file' => $self->getImageFile(),
                            'banner_file' => $self->getImageFile(),
                            'trailer_file' => $self->getVideoFile(),
                            'video_file' => $self->getVideoFile(),
                        ],
                        $this->relations
                    )
                );

            });

        Model::unguard();
    }

    protected function fetchRelations()
    {
        $subGenres = $this->allGenres->random(2)->load('categories');
        $categoriesId = [];

        foreach ($subGenres as $genre){
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }

        $categoriesId = array_unique($categoriesId);

        $genresId = $subGenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
        $this->relations['cast_members_id'] = $this->allCastMembers->random(3)->pluck('id')->toArray();

    }

    protected function getImageFile()
    {
        return new \Illuminate\Http\UploadedFile(
            storage_path("faker/thumbs/laravel.png"),
            'laravel.png'
        );
    }

    protected function getVideoFile()
    {
        return new \Illuminate\Http\UploadedFile(
            storage_path("faker/videos/fake.mp4"),
            'fake.mp4'
        );
    }

}
