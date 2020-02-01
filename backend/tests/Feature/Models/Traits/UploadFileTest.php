<?php


namespace Tests\Feature\Models\Traits;


use Tests\Stubs\Traits\UploadFilesStub;
use Tests\TestCase;

class UploadFileTest extends TestCase
{

    protected $obj;

    public function setUp(): void
    {
        parent::setUp();
        $this->obj = new UploadFilesStub();

        UploadFilesStub::dropTable();
        UploadFilesStub::createTable();
    }

    public function testMakeOldFileOnSave()
    {
        //não existe
        $this->obj->fill([
            'name' => 'test',
            'file1' => 'test1.mp4',
            'file2' => 'test2.mp4',
        ]);
        $this->obj->save();

        $this->assertCount(0, $this->obj->oldFiles);

        //atualiza campo de arquivo
        $this->obj->update([
            'name' => 'test_name',
            'file2' => 'test3.mp4'
        ]);
        $this->assertEqualsCanonicalizing(['test2.mp4'], $this->obj->oldFiles);
    }

    public function testMakeOldFilesNullOnSaving()
    {
        $this->obj->fill([
            'name' => 'test'
        ]);
        $this->obj->save();

        //atualiza campo de arquivo
        $this->obj->update([
            'name' => 'test_name',
            'file2' => 'test3.mp4'
        ]);
        $this->assertEqualsCanonicalizing([], $this->obj->oldFiles);
    }

}
