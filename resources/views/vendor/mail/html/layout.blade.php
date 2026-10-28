<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
@media only screen and (max-width: 600px) {
.inner-body {
width: 100% !important;
}

.footer {
width: 100% !important;
}
}

@media only screen and (max-width: 500px) {
.button {
width: 100% !important;
}
}

/* Dark mode, for the clients that support it (Apple Mail, Outlook apps, ...) */
@media (prefers-color-scheme: dark) {
body,
.wrapper,
.body {
background-color: #09090b !important;
}

.inner-body {
background-color: #18181b !important;
border-color: #27272a !important;
border-top-color: #10b981 !important;
}

h1,
h2,
h3,
.brand-name {
color: #fafafa !important;
}

p,
li,
td,
.panel-content p {
color: #d4d4d8 !important;
}

.inner-body a:not(.button) {
color: #34d399 !important;
}

.button {
color: #ffffff !important;
}

.panel-content {
background-color: #27272a !important;
}

.panel {
border-left-color: #10b981 !important;
}

.subcopy {
border-top-color: #27272a !important;
}

.subcopy p,
.footer p,
.footer a {
color: #71717a !important;
}
}
</style>
{!! $head ?? '' !!}
</head>
<body>

<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
{!! $header ?? '' !!}

<!-- Email Body -->
<tr>
<td class="body" width="100%" cellpadding="0" cellspacing="0" style="border: hidden !important;">
<table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<!-- Body content -->
<tr>
<td class="content-cell">
{!! Illuminate\Mail\Markdown::parse($slot) !!}

{!! $subcopy ?? '' !!}
</td>
</tr>
</table>
</td>
</tr>

{!! $footer ?? '' !!}
</table>
</td>
</tr>
</table>
</body>
</html>
