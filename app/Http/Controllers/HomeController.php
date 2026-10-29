<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The public home page. Signed-in users see it too, with a link to the app.
     */
    public function __invoke(Request $request): Response
    {
        $faq = [
            [__('What does the agent collect?'), __('CPU, load, memory, swap, disk usage, the names and resource use of the busiest processes, failed systemd services and critical log entries. It does not read your files or application data.')],
            [__('Do I need to open any ports?'), __('No. The agent sends data to RackAtlas over HTTPS once a minute. Nothing connects into your server, so your firewall stays as it is.')],
            [__('Which systems are supported?'), __('Debian and Ubuntu on amd64, arm64, armhf and i386, installed from a signed apt repository.')],
            [__('How do I remove the agent?'), __('Run sudo apt purge rackatlas-agent on the server and delete the server in RackAtlas.')],
        ];

        $description = __('RackAtlas monitors Debian and Ubuntu servers with a lightweight agent: CPU, memory, disks, services and critical logs. Alerts by email and push, no open ports.');

        return Inertia::render('welcome', [
            'canRegister' => Route::has('register'),
            'faq' => $faq,
            'seo' => Seo::page(
                __('Linux server monitoring without open ports'),
                $description,
                'home',
                [
                    Seo::organization(),
                    Seo::website(),
                    [
                        '@context' => 'https://schema.org',
                        '@type' => 'SoftwareApplication',
                        'name' => 'RackAtlas',
                        'url' => route('home.localized', ['locale' => app()->getLocale()]),
                        'description' => $description,
                        'applicationCategory' => 'BusinessApplication',
                        'operatingSystem' => 'Web, Debian, Ubuntu',
                        'image' => url('og-image.png'),
                        'inLanguage' => app()->getLocale(),
                        'publisher' => ['@id' => url('/').'#organization'],
                    ],
                    Seo::faqPage($faq),
                ],
                [
                    ['label' => __('Log in'), 'url' => route('login')],
                    ['label' => __('Create account'), 'url' => route('register')],
                    ['label' => __('Privacy and cookies'), 'url' => route('privacy')],
                ],
            ),
        ]);
    }
}
