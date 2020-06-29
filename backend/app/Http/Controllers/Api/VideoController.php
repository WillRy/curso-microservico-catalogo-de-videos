<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VideoResource;
use App\Models\Video;
use App\Rules\GenreHasCategoriesRule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{

    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => [
                'required',
                'array',
                'exists:genres,id,deleted_at,NULL'
            ],
            'cast_members_id' => [
                'required',
                'array',
                'exists:cast_members,id,deleted_at,NULL'
            ],
            'video_file' => 'mimetypes:video/mp4|max:' . Video::VIDEO_FILE_MAX_SIZE,
            'thumb_file' => 'image|max:' . Video::THUMB_FILE_MAX_SIZE,
            'banner_file' => 'image|max:' . Video::BANNER_FILE_MAX_SIZE,
            'trailer_file' => 'mimetypes:video/mp4|max:' . Video::TRAILER_FILE_MAX_SIZE,
        ];
    }

    public function store(Request $request)
    {
        $this->addRuleIfGenreHasCategories($request);
        $validatedData = $this->validate($request, $this->rulesStore());

        $obj = $this->model()::create($validatedData);
        $obj->refresh();

        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);

        $this->addRuleIfGenreHasCategories($request);

        /** RulesPatch usado para o upload de vídeos, que envia somente os campos de video, e não os demais campos da model */
        $validatedData = $this->validate($request, $request->isMethod('PUT') ? $this->rulesUpdate() : $this->rulesPatch());

        $obj->update($validatedData);


        $resource = $this->resource();
        return new $resource($obj);
    }

    /** Adiciona regra personalizada para garantir que o genero tenha ao menos uma categoria */
    protected function addRuleIfGenreHasCategories(Request $request)
    {
        $categoriesId = is_array($request->get('categories_id')) ? $request->get('categories_id') : [];
        $this->rules['genres_id'][] = new GenreHasCategoriesRule(
            $categoriesId
        );
    }


    protected function model()
    {
        return Video::class;
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }

    protected function resource()
    {
        return VideoResource::class;
    }

    protected function resourceCollection()
    {
        return $this->resource();
    }

    protected function queryBuilder(): Builder
    {
        $action = \Route::getCurrentRoute()->getAction()['uses'];
        return parent::queryBuilder()->with(
            [
                strpos($action, 'index') !== false ? 'genres' : 'genres.categories',
                'categories',
                'castMembers'
            ]
        );
    }
}
