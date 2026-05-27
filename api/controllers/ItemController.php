<?php

class ItemController
{
    private $item;

    public function __construct($db)
    {
        $this->item = new Item($db);
    }

    public function index()
    {
        $items = $this->item->readAll();
        echo json_encode(['data' => $items]);
    }

    public function show($id)
    {
        $this->item->id = $id;
        $result = $this->item->readOne();

        if ($result) {
            echo json_encode(['data' => $result]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Item not found.']);
        }
    }

    public function store($data)
    {
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Name is required.']);
            return;
        }

        $this->item->name = $data['name'];
        $this->item->description = $data['description'] ?? '';

        if ($this->item->create()) {
            http_response_code(201);
            echo json_encode(['message' => 'Item created successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create item.']);
        }
    }

    public function update($id, $data)
    {
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Name is required.']);
            return;
        }

        $this->item->id = $id;
        $this->item->name = $data['name'];
        $this->item->description = $data['description'] ?? '';

        if ($this->item->update()) {
            echo json_encode(['message' => 'Item updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update item.']);
        }
    }

    public function destroy($id)
    {
        $this->item->id = $id;

        if ($this->item->delete()) {
            echo json_encode(['message' => 'Item deleted successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete item.']);
        }
    }
}
