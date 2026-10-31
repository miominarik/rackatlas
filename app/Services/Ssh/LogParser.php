<?php

namespace App\Services\Ssh;

use Illuminate\Support\Carbon;
use Throwable;

/**
 * Reads the log sections the agent sends: serious journal entries and failed systemd units.
 */
class LogParser
{
    public const MAX_ENTRIES = 100;

    public const MAX_UNITS = 30;

    private const MESSAGE_LIMIT = 500;

    /**
     * What makes two entries the same problem: level, source and the message without numbers
     * (process ids, counters, addresses in hex).
     */
    public static function signature(string $level, string $source, string $message): string
    {
        return $level.'|'.$source.'|'.preg_replace('/0x[0-9a-f]+|\d+/i', '#', $message);
    }

    /**
     * Identical messages (ignoring numbers such as process ids) are merged into one entry with a count.
     *
     * @return array<int, array{level: string, source: string, message: string, count: int, occurred_at: Carbon}>
     */
    public function parseJournal(string $section, string $level): array
    {
        $groups = [];

        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            if (! preg_match('/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:?\d{2}|Z))\s+\S+\s+([^\s:\[]+)(?:\[\d+\])?:\s?(.*)$/', $line, $match)) {
                continue;
            }

            try {
                $time = Carbon::parse($match[1]);
            } catch (Throwable) {
                continue;
            }

            $source = mb_substr($match[2], 0, 100);
            $message = mb_substr(trim($match[3]), 0, self::MESSAGE_LIMIT);

            if ($message === '') {
                continue;
            }

            $key = self::signature($level, $source, $message);

            if (! isset($groups[$key])) {
                $groups[$key] = [
                    'level' => $level,
                    'source' => $source,
                    'message' => $message,
                    'count' => 0,
                    'occurred_at' => $time,
                ];
            }

            $groups[$key]['count']++;

            if ($time->greaterThan($groups[$key]['occurred_at'])) {
                $groups[$key]['occurred_at'] = $time;
            }
        }

        $entries = array_values($groups);
        usort($entries, fn (array $a, array $b) => $b['occurred_at'] <=> $a['occurred_at']);

        return array_slice($entries, 0, self::MAX_ENTRIES);
    }

    /**
     * @return array<int, string>
     */
    public function parseFailedUnits(string $section): array
    {
        $units = [];

        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            $line = ltrim($line, " \t●*");
            $name = strtok($line, " \t");

            if ($name !== false && preg_match('/^[\w@.\-:\\\\]+\.(service|socket|timer|mount|path|target)$/', $name)) {
                $units[$name] = $name;
            }
        }

        return array_slice(array_values($units), 0, self::MAX_UNITS);
    }
}
