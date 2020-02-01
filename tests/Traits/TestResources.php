<?php


namespace Tests\Traits;


use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait TestResources
{

    abstract function resource();
    protected function assertResource(TestResponse $response, JsonResource $resource)
    {
        $response->assertJson($resource->response()->getData(true));
    }

    protected function getResource(TestResponse $response,  $model)
    {
        $id = $response->json('data.id');
        $resource = $this->resource();
        return new $resource($model::find($id));
    }
}
