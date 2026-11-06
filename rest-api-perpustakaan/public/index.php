<?php

declare(strict_types=1);

// ===== LANGKAH 16: blok CORS (harus di paling atas, sebelum require_once) =====
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Max-Age: 86400');

// Preflight: browser mengirim OPTIONS dulu sebelum request sebenarnya
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
// ===== akhir blok CORS =====

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Env;
use App\Contracts\BookRepositoryInterface;
use App\Contracts\CategoryRepositoryInterface;
use App\Controllers\BookController;
use App\Controllers\CategoryController;
use App\Core\Container;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Database\Connection;
use App\Repositories\MySQLBookRepository;
use App\Repositories\MySQLCategoryRepository;
use App\Services\BookService;
use App\Services\CategoryService;

try {
    Env::load(__DIR__ . '/../.env');

    // ---- Composition Root: semua binding dependency ada di sini ----
    $container = new Container();
    $container->singleton(PDO::class, fn() => Connection::get());

    // Buku
    $container->bind(BookRepositoryInterface::class, fn(Container $c) => new MySQLBookRepository($c->make(PDO::class)));
    $container->bind(BookService::class, fn(Container $c) => new BookService($c->make(BookRepositoryInterface::class)));
    $container->bind(BookController::class, fn(Container $c) => new BookController($c->make(BookService::class)));

    // Kategori
    $container->bind(CategoryRepositoryInterface::class, fn(Container $c) => new MySQLCategoryRepository($c->make(PDO::class)));
    $container->bind(CategoryService::class, fn(Container $c) => new CategoryService($c->make(CategoryRepositoryInterface::class)));
    $container->bind(CategoryController::class, fn(Container $c) => new CategoryController($c->make(CategoryService::class)));

    // ---- Routing ----
    $router = new Router($container);

    // Router hanya menerima callable, jadi buat objek controllernya dulu
    $bookController     = $container->make(BookController::class);
    $categoryController = $container->make(CategoryController::class);

    // Buku
    $router->get('/api/books',         [$bookController, 'index']);
    $router->get('/api/books/{id}',    [$bookController, 'show']);
    $router->post('/api/books',        [$bookController, 'store']);
    $router->put('/api/books/{id}',    [$bookController, 'update']);
    $router->delete('/api/books/{id}', [$bookController, 'destroy']);

    // Kategori
    $router->get('/api/categories',         [$categoryController, 'index']);
    $router->get('/api/categories/{id}',    [$categoryController, 'show']);
    $router->post('/api/categories',        [$categoryController, 'store']);
    $router->put('/api/categories/{id}',    [$categoryController, 'update']);
    $router->delete('/api/categories/{id}', [$categoryController, 'destroy']);

    $router->dispatch(new Request());
} catch (Throwable $e) {
    Response::error('Terjadi kesalahan server: ' . $e->getMessage(), 500);
}