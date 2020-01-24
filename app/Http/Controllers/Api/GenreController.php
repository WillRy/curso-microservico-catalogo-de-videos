<?php

namespace App\Http\Controllers\Api;

use App\Models\Genre;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GenreController extends BasicCrudController
{

    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id'
    ];

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());

        $self = $this;
        return \DB::transaction(function () use($request, $validatedData, $self){
            $genre = Genre::create($validatedData);
            $self->handleRelations($genre, $request);
            return $genre->refresh();
        });
    }

    public function update(Request $request, $id)
    {
        $genre = $this->findOrFail($id);

        $validatedData = $this->validate($request, $this->rulesUpdate());

        $self = $this;
        $genre = \DB::transaction(function () use($request, $validatedData, $self, $genre){
            $genre->update($validatedData);
            $self->handleRelations($genre, $request);
            return $genre->refresh();
        });

        return $genre;
    }

    protected function handleRelations($genre, Request $request)
    {
        $genre->categories()->sync($request->post('categories_id'));
    }

    protected function model()
    {
        return Genre::class;
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
