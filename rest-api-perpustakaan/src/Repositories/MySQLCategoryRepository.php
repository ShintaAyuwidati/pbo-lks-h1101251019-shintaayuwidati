<?php

namespace App\Repositories;

use App\Contracts\CategoryRepositoryInterface;
use App\Models\Category;
use InvalidArgumentException;
use PDO;
use PDOException;

/**
 * MySQLCategoryRepository — implementasi konkret CategoryRepositoryInterface.
 * Di sini detail teknis (PDO, SQL) boleh muncul.
 */
class MySQLCategoryRepository implements CategoryRepositoryInterface
{
    public function __construct(private PDO $pdo) {}

    public function findAll(): array
    {
        $stmt = $this->pdo->query(
            "SELECT * FROM categories ORDER BY nama ASC"
        );

        return array_map(
            fn(array $row) => $this->toModel($row),
            $stmt->fetchAll()
        );
    }

    public function findById(int $id): ?Category
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM categories WHERE id = ?"
        );

        $stmt->execute([$id]);
        $row = $stmt->fetch();

        return $row ? $this->toModel($row) : null;
    }

    public function create(Category $category): Category
    {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO categories (nama, deskripsi) VALUES (?, ?)"
            );

            $stmt->execute([
                $category->getNama(),
                $category->getDeskripsi(),
            ]);
        } catch (PDOException $e) {
            $this->rethrowDuplicate($e);
        }

        return new Category(
            (int) $this->pdo->lastInsertId(),
            $category->getNama(),
            $category->getDeskripsi()
        );
    }

    public function update(int $id, Category $category): bool
    {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE categories SET nama = ?, deskripsi = ? WHERE id = ?"
            );

            $stmt->execute([
                $category->getNama(),
                $category->getDeskripsi(),
                $id,
            ]);
        } catch (PDOException $e) {
            $this->rethrowDuplicate($e);
        }

        // Di MySQL rowCount bisa 0 jika data sama persis, jadi cek keberadaan baris.
        return $this->findById($id) !== null;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM categories WHERE id = ?"
        );

        $stmt->execute([$id]);

        return $stmt->rowCount() > 0;
    }

    private function rethrowDuplicate(PDOException $e): never
    {
        // 23000 = pelanggaran constraint (kolom nama UNIQUE)
        if ($e->getCode() === '23000') {
            throw new InvalidArgumentException('Nama kategori sudah digunakan');
        }

        throw $e;
    }

    private function toModel(array $row): Category
    {
        return new Category(
            (int) $row['id'],
            $row['nama'],
            $row['deskripsi'] ?? null
        );
    }
}