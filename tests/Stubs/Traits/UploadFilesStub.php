<?php


namespace Tests\Stubs\Traits;


use App\Models\Traits\UploadFiles;
use Illuminate\Database\Eloquent\Model;

class UploadFilesStub extends Model
{

    use UploadFiles;

    public static $fileFields = ['file1', 'file2'];

    protected function uploadDir()
    {
        return '1';
    }
}
