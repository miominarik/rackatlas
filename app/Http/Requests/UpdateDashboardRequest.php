<?php

namespace App\Http\Requests;

use App\Support\DashboardSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->currentTeam() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $rules = [
            'widgets' => ['required', 'array', 'size:'.count(DashboardSettings::WIDGETS)],
            'widgets.*.id' => ['required', 'distinct', Rule::in(DashboardSettings::WIDGETS)],
            'widgets.*.visible' => ['required', 'boolean'],
            'servers.sort' => ['required', Rule::in(DashboardSettings::SORTS)],
            'servers.density' => ['required', Rule::in(DashboardSettings::DENSITIES)],
            'servers.group_by_category' => ['required', 'boolean'],
            'servers.metrics' => ['present', 'array'],
            'servers.metrics.*' => ['distinct', Rule::in(DashboardSettings::METRICS)],
            'servers.show_history' => ['required', 'boolean'],
            'refresh_seconds' => ['required', 'integer', Rule::in(DashboardSettings::REFRESH_SECONDS)],
        ];

        foreach (['cpu', 'ram', 'disk'] as $metric) {
            $rules["thresholds.$metric.warn"] = ['required', 'integer', 'between:1,99', "lt:thresholds.$metric.critical"];
            $rules["thresholds.$metric.critical"] = ['required', 'integer', 'between:2,100'];
        }

        return $rules;
    }
}
