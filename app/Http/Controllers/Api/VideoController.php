<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use App\Rules\GenreHasCategoriesRule;
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
            'rating' => 'required|in:'. implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => [
                'required',
                'array',
                'exists:genres,id,deleted_at,NULL'
            ]
        ];
    }

    public function store(Request $request)
    {
        $this->addRuleIfGenreHasCategories($request);
        $validatedData = $this->validate($request, $this->rulesStore());

        $self = $this;
        $obj = \DB::transaction(function () use($self, $request, $validatedData) {

            $obj = $this->model()::create($validatedData);
            $self->handleRelations($obj, $request);

            return $obj->refresh();
        });
        return $obj;


    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);

        $this->addRuleIfGenreHasCategories($request);
        $validatedData = $this->validate($request, $this->rulesUpdate());

        $self = $this;
        $obj = \DB::transaction(function () use($self, $request, $obj, $validatedData) {

            $obj->update($validatedData);
            $self->handleRelations($obj, $request);

            return $obj->refresh();
        });
        return $obj;


    }

    protected function addRuleIfGenreHasCategories(Request $request)
    {

        $categoriesId = is_array($request->get('categories_id')) ? $request->get('categories_id') : [];
        $this->rules['genres_id'][] = new GenreHasCategoriesRule(
            $categoriesId
        );

    }

    protected function handleRelations($video, Request $request)
    {
        $video->categories()->sync($request->post('categories_id'));
        $video->genres()->sync($request->post('genres_id'));
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
}