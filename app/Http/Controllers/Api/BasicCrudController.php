<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{

    protected abstract function model();
    protected abstract function rulesStore();


    public function index()
    {
        return $this->model()::all();
    }

    public function show($id)
    {
        return $this->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        $obj = $this->model()::create($validatedData);
        return $obj->refresh();
    }

    public function update(Request $request, $id)
    {
        $model = $this->findOrFail($id);
        $model->update($request->all());
        return $model;
    }

    public function destroy($id)
    {
        $model = $this->findOrFail($id);
        $model->delete();
        return \Response::noContent();
    }

    protected function findOrFail($id)
    {
        $model = $this->model();

         /** Pega a key name para saber qual o meio de busca. Seja id ou slug */
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }

}
