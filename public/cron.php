<?php

/*
 * Entry point for hostings whose cron can only call one file or one URL.
 * It runs the Laravel scheduler (`schedule:run`) once. Call it every minute:
 *
 *  - as a file:  /full/path/to/public/cron.php   (runs from the command line)
 *  - as a URL:   https://your-domain/cron.php?token=CRON_TOKEN
 */

use Illuminate\Contracts\Console\Kernel;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$isCli = PHP_SAPI === 'cli';

if (! $isCli) {
    $expected = (string) $app['config']->get('app.cron_token', '');
    $given = (string) ($_GET['token'] ?? '');

    if ($expected === '' || ! hash_equals($expected, $given)) {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }

    // Answer the caller straight away, the scheduler keeps running after that.
    ignore_user_abort(true);
    @set_time_limit(0);
    header('Content-Type: text/plain');
    header('Connection: close');
    echo 'ok';

    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        header('Content-Length: 2');
        @ob_end_flush();
        flush();
    }
}

$output = new BufferedOutput;

$status = $kernel->handle(new ArrayInput(['command' => 'schedule:run']), $output);

if ($isCli) {
    echo $output->fetch();
}

$kernel->terminate(new ArrayInput([]), $status);
exit($status);
