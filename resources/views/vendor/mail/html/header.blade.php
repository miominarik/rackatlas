@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<table align="center" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td style="padding-right: 10px;" valign="middle">
{{-- The logo is made of table cells, because many mail clients block images and SVG. --}}
<table cellpadding="0" cellspacing="0" role="presentation" width="36" height="36" bgcolor="#059669" style="background-color: #059669; border-radius: 9px;">
<tr>
<td align="center" valign="middle" width="36" height="36" style="line-height: 0; font-size: 0;">
<table cellpadding="0" cellspacing="0" role="presentation" width="20" align="center">
<tr><td height="4" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 2px; height: 4px; line-height: 4px; font-size: 0;">&nbsp;</td></tr>
<tr><td height="3" style="height: 3px; line-height: 3px; font-size: 0;">&nbsp;</td></tr>
<tr><td height="4" bgcolor="#d1fae5" style="background-color: #d1fae5; border-radius: 2px; height: 4px; line-height: 4px; font-size: 0;">&nbsp;</td></tr>
<tr><td height="3" style="height: 3px; line-height: 3px; font-size: 0;">&nbsp;</td></tr>
<tr><td height="4" bgcolor="#a7f3d0" style="background-color: #a7f3d0; border-radius: 2px; height: 4px; line-height: 4px; font-size: 0;">&nbsp;</td></tr>
</table>
</td>
</tr>
</table>
</td>
<td valign="middle" class="brand-name" style="color: #09090b; font-size: 21px; font-weight: 700; letter-spacing: -0.02em;">
{!! $slot !!}
</td>
</tr>
</table>
</a>
</td>
</tr>
