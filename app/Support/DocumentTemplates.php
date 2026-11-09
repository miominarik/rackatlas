<?php

namespace App\Support;

/**
 * The templates a page of documentation starts from: a few short questions with an
 * example of the answer, and the sections that a page of that kind should have.
 * Texts are translated here, so the pages get them ready.
 */
class DocumentTemplates
{
    /** Words in a field or a section that suggest a secret was pasted in. */
    public const SECRET_PATTERN = '/-----BEGIN [A-Z ]*PRIVATE KEY-----/';

    /**
     * @return array<string, array{key: string, icon: string, label: string, description: string, fields: array<int, array{key: string, label: string, type: string, placeholder: string}>, sections: array<int, array{title: string, body: string}>}>
     */
    public static function all(): array
    {
        return [
            'server' => [
                'key' => 'server',
                'icon' => 'server',
                'label' => __('Server overview'),
                'description' => __('What the server is for, who runs it, how to get in and when it expires. Start here.'),
                'fields' => [
                    self::field('purpose', __('Purpose'), __('Production web and database for the e-shop')),
                    self::field('provider', __('Provider'), __('Hetzner, Contabo, DigitalOcean...')),
                    self::field('ip', __('IP address'), '203.0.113.10'),
                    self::field('os', __('Operating system'), 'Ubuntu 24.04 LTS'),
                    self::field('access', __('How to log in'), __('ssh deploy@203.0.113.10, key in the password manager'), 'textarea'),
                    self::field('credentials', __('Where the credentials are'), __('Link or name of the entry in the password manager'), 'text'),
                    self::field('contact', __('Responsible person'), __('Name, phone, e-mail')),
                    self::field('price', __('Price'), '9,90 EUR / '.__('month')),
                    self::field('renewal', __('Renewal date'), '', 'date'),
                ],
                'sections' => [
                    self::section(__('What runs here'), __('- nginx + PHP-FPM (web)')."\n".__('- MySQL (database)')),
                    self::section(__('Maintenance notes'), __('When updates are installed, who may reboot the server, known quirks.')),
                ],
            ],
            'service' => [
                'key' => 'service',
                'icon' => 'layers',
                'label' => __('Service'),
                'description' => __('One service on a server: where it listens, where its files are and how to restart it.'),
                'fields' => [
                    self::field('service', __('Service name'), 'nginx'),
                    self::field('version', __('Version'), '1.26'),
                    self::field('port', __('Port'), '80, 443'),
                    self::field('unit', __('systemd unit'), 'nginx.service'),
                    self::field('config_path', __('Configuration path'), '/etc/nginx/'),
                    self::field('data_path', __('Data path'), '/var/www'),
                    self::field('log_path', __('Log path'), '/var/log/nginx/'),
                    self::field('dependencies', __('Depends on'), __('PHP-FPM, MySQL'), 'textarea'),
                ],
                'sections' => [
                    self::section(__('Configuration'), __('Which settings are changed from the default and why.')),
                    self::section(__('Restart and reload'), "```\nsystemctl reload nginx\n```"),
                    self::section(__('Known issues'), ''),
                ],
            ],
            'backup' => [
                'key' => 'backup',
                'icon' => 'database-backup',
                'label' => __('Backup and restore'),
                'description' => __('What is backed up, where it goes and, above all, how to get it back.'),
                'fields' => [
                    self::field('what', __('What is backed up'), __('MySQL database "shop", /var/www/uploads'), 'textarea'),
                    self::field('destination', __('Where the backups go'), __('S3 bucket, other server, ...')),
                    self::field('schedule', __('How often'), __('Every night at 02:00')),
                    self::field('retention', __('How long they are kept'), __('30 days')),
                    self::field('tool', __('Tool'), 'restic, borg, mysqldump...'),
                    self::field('key_location', __('Where the encryption key is stored'), __('Name of the entry in the password manager, never the key itself')),
                    self::field('restore_tested', __('Last restore test'), '', 'date'),
                ],
                'sections' => [
                    self::section(__('Restore procedure'), __('1. Where to download the backup')."\n".__('2. Commands to restore it')."\n".__('3. How to check that it works')),
                    self::section(__('After the restore'), __('Services to start, caches to clear, who to tell.')),
                ],
            ],
            'deploy' => [
                'key' => 'deploy',
                'icon' => 'rocket',
                'label' => __('Deployment and update'),
                'description' => __('A step by step procedure for releasing a new version or updating the system.'),
                'fields' => [
                    self::field('repository', __('Repository'), 'git@github.com:company/shop.git'),
                    self::field('branch', __('Branch'), 'main'),
                    self::field('downtime', __('Expected downtime'), __('None, or about 2 minutes')),
                    self::field('who', __('Who may deploy'), __('Names or roles')),
                ],
                'sections' => [
                    self::section(__('Before you start'), __('- Backup is fresh')."\n".__('- Nobody else is deploying')),
                    self::section(__('Steps'), "1. git pull\n2. composer install --no-dev\n3. php artisan migrate --force"),
                    self::section(__('Check that it works'), ''),
                    self::section(__('Rollback'), __('How to return to the previous version when something goes wrong.')),
                ],
            ],
            'incident' => [
                'key' => 'incident',
                'icon' => 'siren',
                'label' => __('Incident runbook'),
                'description' => __('What to do when something breaks, written for someone half asleep at night.'),
                'fields' => [
                    self::field('severity', __('Severity'), __('Whole site down / slow / degraded')),
                    self::field('affected', __('What is affected'), __('Shop, API, e-mails...')),
                    self::field('escalation', __('Who to call next'), __('Name and phone number'), 'textarea'),
                ],
                'sections' => [
                    self::section(__('Symptoms'), __('How you notice it: alert, error message, what customers see.')),
                    self::section(__('Diagnosis'), "```\nsystemctl status nginx\njournalctl -u nginx -n 100\ndf -h\n```"),
                    self::section(__('Resolution'), __('Steps that fix it, in order.')),
                    self::section(__('Escalation'), __('When to give up and who to wake up.')),
                ],
            ],
            'network' => [
                'key' => 'network',
                'icon' => 'network',
                'label' => __('Network, DNS and firewall'),
                'description' => __('Domains, DNS records, open ports and firewall rules.'),
                'fields' => [
                    self::field('domains', __('Domains'), 'example.com, www.example.com', 'textarea'),
                    self::field('dns_provider', __('Where DNS is managed'), 'Cloudflare, Websupport...'),
                    self::field('open_ports', __('Open ports'), '22, 80, 443', 'textarea'),
                    self::field('firewall', __('Firewall'), 'ufw, nftables, provider firewall...'),
                    self::field('domain_expiry', __('Domain expires'), '', 'date'),
                ],
                'sections' => [
                    self::section(__('DNS records'), "| Name | Type | Value |\n|---|---|---|\n| @ | A | 203.0.113.10 |"),
                    self::section(__('Firewall rules'), ''),
                ],
            ],
            'blank' => [
                'key' => 'blank',
                'icon' => 'file-text',
                'label' => __('Blank page'),
                'description' => __('Your own structure. Add as many sections as you need.'),
                'fields' => [],
                'sections' => [
                    self::section(__('Notes'), ''),
                ],
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    /**
     * @return array<int, string> The keys of the structured fields of the template.
     */
    public static function fieldKeys(string $template): array
    {
        return array_column(self::all()[$template]['fields'] ?? [], 'key');
    }

    /**
     * @return array{key: string, label: string, type: string, placeholder: string}
     */
    private static function field(string $key, string $label, string $placeholder, string $type = 'text'): array
    {
        return ['key' => $key, 'label' => $label, 'type' => $type, 'placeholder' => $placeholder];
    }

    /**
     * @return array{title: string, body: string}
     */
    private static function section(string $title, string $body): array
    {
        return ['title' => $title, 'body' => $body];
    }
}
