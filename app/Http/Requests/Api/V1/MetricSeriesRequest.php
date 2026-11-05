<?php

namespace App\Http\Requests\Api\V1;

use App\Services\Api\MetricSeries;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class MetricSeriesRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'interval' => ['nullable', 'integer', Rule::in(MetricSeries::INTERVALS)],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $from = $this->from();
            $to = $this->to();

            if ($from->gte($to)) {
                $validator->errors()->add('from', __('validation.before', ['attribute' => 'from', 'date' => 'to']));

                return;
            }

            if ($from->diffInDays($to, true) > MetricSeries::MAX_RANGE_DAYS) {
                $validator->errors()->add('from', 'The range may be at most '.MetricSeries::MAX_RANGE_DAYS.' days.');

                return;
            }

            if ($from->diffInSeconds($to, true) / $this->bucket() > MetricSeries::MAX_POINTS) {
                $validator->errors()->add('interval', 'The range holds more than '.MetricSeries::MAX_POINTS.' points, use a larger interval.');
            }
        }];
    }

    public function from(): CarbonInterface
    {
        return $this->filled('from') ? Carbon::parse($this->input('from')) : $this->to()->subDay();
    }

    public function to(): CarbonInterface
    {
        return $this->filled('to') ? Carbon::parse($this->input('to')) : now();
    }

    public function bucket(): int
    {
        return (int) ($this->input('interval') ?: MetricSeries::defaultInterval($this->from(), $this->to()));
    }
}
