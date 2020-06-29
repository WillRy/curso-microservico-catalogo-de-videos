<?php

namespace App\Observers;

use Bschmitt\Amqp\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SyncModelObserver
{


    public function created(Model $model)
    {
        // delivery mode 2 = peristent
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $this->reportException(['modelName' => $modelName, 'id' => $model->id, 'action' => $action, 'exception' => $e]);
        }
    }


    public function updated(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $this->reportException(['modelName' => $modelName, 'id' => $model->id, 'action' => $action, 'exception' => $e]);
        }
    }


    public function deleted(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = ['id' => $model->id];
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $this->reportException(['modelName' => $modelName, 'id' => $model->id, 'action' => $action, 'exception' => $e]);
        }
    }

    protected function publish($routingKey, array $data)
    {
        $message = new Message(json_encode($data), ['content_type' => 'application/json', 'delivery_mode' => 2]);
        \Amqp::publish($routingKey, $message, ['exchange_type' => 'topic', 'exchange' => 'amq.topic']);
    }

    protected function getModelName(Model $model)
    {
        $shortname = (new \ReflectionClass($model))->getShortName();
        return Str::snake($shortname);
    }

    protected function reportException(array $params)
    {
        list(
            'modelName' => $modelName,
            'id' => $id,
            'action' => $action,
            'exception' => $exception
            ) = $params;
        $myException = new \Exception("The model $modelName with ID {$id} not synced on $action", 0, $exception);
        report($myException);
    }


}
