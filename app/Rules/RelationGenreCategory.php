<?php

namespace App\Rules;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Contracts\Validation\Rule;

class RelationGenreCategory implements Rule
{

    protected $error;
    protected $attribute;
    public function __construct()
    {

    }


    public function passes($attribute, $value)
    {
        $this->attribute = $attribute;
        return $this->checkIfExistsRelations();
    }



    public function checkIfExistsRelations()
    {
        $request = \Request::post();

        if(empty($request['genres_id']) || empty($request['categories_id']))
            return false;


        /**
         * Checa se cada um dos generos tem ao menos uma das categorias passadas
         */
        foreach ($request['genres_id'] as $genreId){
            $genre = Genre::findOrFail($genreId);


            $ownedCategories = $genre->categories()->findMany($request['categories_id'])->pluck('id')->all();

            if(empty($ownedCategories))
                return false;


        }


        /**
         * Checa se cada uma das categorias tem ao menos um dos generos passados
         */
        foreach ($request['categories_id'] as $categoryId){
            $category = Category::findOrFail($categoryId);

            $ownedGenres = $category->genres()->findMany($request['genres_id'])->pluck('id')->all();

            if(empty($ownedGenres))
                return false;

        }


        return true;
    }


    public function message()
    {
        $fieldName = str_replace('_',' ', $this->attribute);
        return \Lang::get("validation.exists",['attribute' => $fieldName]);
    }
}
