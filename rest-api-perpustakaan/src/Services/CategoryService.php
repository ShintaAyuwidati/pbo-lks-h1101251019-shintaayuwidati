<?php

namespace App\Services;

use App\Contracts\CategoryRepositoryInterface;
use App\Models\Category;
use InvalidArgumentException;

/**
 * CategoryService — logika bisnis kategori.
 * TIDAK tahu database apa yang dipakai (hanya tahu interface).
 */
class CategoryService
{
    public function __construct(
        private CategoryRepositoryInterface $repo
    ) {}

    public function list(): array
    {
        return array_map(
            fn(Category $c) => $c->toArray(),
            $this->repo->findAll()
        );
    }

    public function detail(int $id): array
    {
        $category = $this->repo->findById($id);

        if ($category === null) {
            throw new InvalidArgumentException(
                "Kategori dengan ID $id tidak ditemukan",
                404
            );
        }

        return $category->toArray();
    }

    public function create(array $data): array
    {
        $this->validate($data);

        $category = new Category(
            null,
            trim($data['nama']),
            $data['deskripsi'] ?? ''
        );

        // create() sudah mengembalikan Category lengkap dengan ID barunya
        $saved = $this->repo->create($category);

        return $saved->toArray();
    }

    public function update(int $id, array $data): array
    {
        if ($this->repo->findById($id) === null) {
            throw new InvalidArgumentException(
                "Kategori dengan ID $id tidak ditemukan",
                404
            );
        }

        $this->validate($data);

        $category = new Category(
            $id,
            trim($data['nama']),
            $data['deskripsi'] ?? ''
        );

        $this->repo->update($id, $category);

        return $this->detail($id);
    }

    public function delete(int $id): void
    {
        if ($this->repo->findById($id) === null) {
            throw new InvalidArgumentException(
                "Kategori dengan ID $id tidak ditemukan",
                404
            );
        }

        $this->repo->delete($id);
    }

    /** Validasi input. */
    private function validate(array $data): void
    {
        if (trim((string) ($data['nama'] ?? '')) === '') {
            throw new InvalidArgumentException(
                'Nama kategori wajib diisi',
                422
            );
        }

        if (mb_strlen(trim($data['nama'])) > 100) {
            throw new InvalidArgumentException(
                'Nama maksimal 100 karakter',
                422
            );
        }
    }
}