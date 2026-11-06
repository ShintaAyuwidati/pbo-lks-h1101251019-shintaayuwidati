<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Category;

interface CategoryRepositoryInterface
{
    /** @return Category[] */
    public function findAll(): array;

    public function findById(int $id): ?Category;

    public function create(Category $category): Category;

    public function update(int $id, Category $category): bool;

    public function delete(int $id): bool;
}