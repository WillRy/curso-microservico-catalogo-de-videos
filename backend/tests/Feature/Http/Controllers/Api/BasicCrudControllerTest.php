<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Controller\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;
use Mockery;


class BasicCrudControllerTest extends TestCase
{

    private $controller;

    protected function setUp(): void
    {

        parent::setUp();

        //caso o tearDown nao seja executado, exclui tabela que nao foi deletada
        CategoryStub::dropTable();
        CategoryStub::createTable();

        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }

    public function testIndex()
    {
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description'])->refresh();

        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);

        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn([]);

        $serialized = $this->controller->index($request)->response()->getData(true);
        $this->assertEquals([$category->toArray()], $serialized['data']);

        $this->assertArrayHasKey('meta',  $serialized);
        $this->assertArrayHasKey('links',  $serialized);

    }

    public function testInvalidationDataInStore()
    {
        $this->expectException(ValidationException::class);

        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->controller->store($request);

    }

    public function testInvalidationDataInUpdate()
    {
        $this->expectException(ValidationException::class);

        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description'])->refresh();
        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->controller->update($request, $category->id);
    }


    public function testStore()
    {
        $request = Mockery::mock(Request::class);

        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name', 'description' => 'test_description']);

        $result = $this->controller->store($request);

        $serialized = $result->response()->getData(true);
        $this->assertEquals(
            CategoryStub::first()->toArray(),
            $serialized['data']
        );
    }

    public function testIfFindOrFailFetchModel()
    {
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description'])->refresh();

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        /** Faço o metodo ser chamado pelo CategoryControllerStub */
        $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionWhenIdInvalid()
    {
        $this->expectException(ModelNotFoundException::class);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        /** Faço o metodo ser chamado pelo CategoryControllerStub */
        $reflectionMethod->invokeArgs($this->controller, [0]);

    }

    public function testShow()
    {
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description'])->refresh();
        $result = $this->controller->show($category->id);
        $serialized = $result->response()->getData(true);
        $this->assertEquals($serialized['data'], CategoryStub::find(1)->toArray());
    }


    public function testUpdate()
    {
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_changed', 'description' => 'test_description_changed']);
        $result = $this->controller->update($request, $category->id);
        $serialized = $result->response()->getData(true);
        $this->assertEquals($serialized['data'], CategoryStub::find(1)->toArray());
    }

    public function testDestroy()
    {
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $response = $this->controller->destroy($category->id);
        $this
            ->createTestResponse($response)
            ->assertStatus(204);
        $this->assertCount(0, CategoryStub::all());
    }


}
