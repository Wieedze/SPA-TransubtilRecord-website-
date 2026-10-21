#!/usr/bin/env python3
"""Builds the 7 Resend email templates (dark layout, logo, flame side bands) and
updates + publishes them in Resend by alias.

Usage: python3 scripts/resend-templates.py .dev.vars
Needs a full-access RESEND_API_KEY in that file. Images are served from
https://transubtil-record.com/email/ (public/email/), so they show once the site
is deployed to production.
"""
import json, re, sys, urllib.request
key = re.search(r'^RESEND_API_KEY=(.*)$', open(sys.argv[1]).read(), re.M).group(1).strip().strip('"\'')
def api(method, path, body=None):
    req = urllib.request.Request("https://api.resend.com" + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "transubtil-setup"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: return {"error": e.code, "body": e.read().decode()[:300]}

SITE = "https://transubtil-record.com"
def layout(title, body, cta=None):
    button = (f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px 0 0"><tr><td style="border:1px solid #F9BC14;border-radius:2px">'
              f'<a href="{cta[1]}" style="display:inline-block;padding:12px 22px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#F9BC14;text-decoration:none">{cta[0]}</a></td></tr></table>') if cta else ""
    band = lambda side: (f'<td class="band" width="70" valign="top" background="{SITE}/email/band-{side}.png" bgcolor="#07060B" '
                         f'style="width:70px;background-color:#07060B;background-image:url({SITE}/email/band-{side}.png);background-repeat:repeat-y;background-size:70px auto;background-position:top {side}">&nbsp;</td>')
    return f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
<style>@media (max-width:520px){{.band{{display:none!important;width:0!important}} .main{{padding:28px 20px!important}}}}</style></head>
<body style="margin:0;padding:0;background:#07060B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07060B" style="background:#07060B"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#07060B"><tr>
{band("left")}
<td class="main" valign="top" style="padding:36px 30px 32px;font-family:Helvetica,Arial,sans-serif;color:#D6D2C8;font-size:15px;line-height:1.65">
<a href="{SITE}" style="text-decoration:none"><img src="{SITE}/email/logo-white.png" alt="Transubtil Records" width="210" style="display:block;border:0;width:210px;max-width:100%;height:auto"></a>
<div style="height:1px;background:#F9BC14;opacity:.6;margin:26px 0 28px;line-height:1px;font-size:1px">&nbsp;</div>
<h1 style="margin:0 0 18px;font-family:Michroma,Helvetica,Arial,sans-serif;font-weight:400;font-size:19px;line-height:1.35;letter-spacing:.02em;text-transform:uppercase;color:#F3EFE4">{title}</h1>
{body}{button}
<div style="height:1px;background:#2C2A36;margin:34px 0 16px;line-height:1px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-size:12px;line-height:1.6;color:#A8A5B0">Transubtil Records · International psytrance label from France<br>
<a href="{SITE}/artists" style="color:#A8A5B0">Artists</a> · <a href="{SITE}/releases" style="color:#A8A5B0">Releases</a> · <a href="https://transubtilrec.bandcamp.com" style="color:#A8A5B0">Bandcamp</a> · <a href="https://soundcloud.com/transubtil" style="color:#A8A5B0">SoundCloud</a><br><a href="https://www.instagram.com/transubtilrecords/" style="color:#A8A5B0">Instagram</a> · <a href="https://www.facebook.com/Transubtilrec" style="color:#A8A5B0">Facebook</a> · <a href="https://www.youtube.com/@transubtilrecord4776" style="color:#A8A5B0">YouTube</a></p>
</td>
{band("right")}
</tr></table></td></tr></table></body></html>"""

def rows(pairs):
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 0">' + "".join(
        f'<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #2C2A36;color:#A8A5B0;font-size:12px;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;vertical-align:top">{k}</td><td style="padding:8px 0;border-bottom:1px solid #2C2A36;font-size:14px;color:#F3EFE4">{{{{{{{v}}}}}}}</td></tr>' for k, v in pairs) + "</table>"

def var(k, optional=False): return {"key": k, "type": "string", **({"fallback_value": "—"} if optional else {})}

MAIL_FROM = "Transubtil Records <hello@mail.transubtil-record.com>"
NEWS_FROM = "Transubtil Records <news@news.transubtil-record.com>"
templates = [
 dict(alias="booking-notification", name="Booking request (to the label)", from_=MAIL_FROM,
      subject="New booking request: {{{ARTIST_NAME}}}",
      html=layout("New booking request for {{{ARTIST_NAME}}}", "<p style=\"margin:0\">Reply to this email to answer the promoter directly.</p>" + rows([("Artist","ARTIST_NAME"),("Name","NAME"),("Email","SENDER_EMAIL"),("Event","EVENT"),("Date","DATE"),("Venue","VENUE"),("Capacity","CAPACITY"),("Fee budget","BUDGET"),("Message","MESSAGE")])),
      variables=[var("ARTIST_NAME"),var("NAME"),var("SENDER_EMAIL"),var("EVENT"),var("DATE"),var("VENUE"),var("CAPACITY",True),var("BUDGET",True),var("MESSAGE",True)]),
 dict(alias="booking-confirmation", name="Booking request (receipt to the promoter)", from_=MAIL_FROM,
      subject="We received your booking request for {{{ARTIST_NAME}}}",
      html=layout("Thanks, {{{NAME}}}", "<p style=\"margin:0 0 12px\">We received your booking request for <strong style=\"color:#F3EFE4\">{{{ARTIST_NAME}}}</strong> ({{{EVENT}}}, {{{DATE}}}).</p><p style=\"margin:0\">The label will get back to you by email. You can reply to this message to add details.</p>", ("Browse the roster","https://transubtil-record.com/artists")),
      variables=[var("NAME"),var("ARTIST_NAME"),var("EVENT"),var("DATE")]),
 dict(alias="demo-notification", name="Demo submission (to the label)", from_=MAIL_FROM,
      subject="New demo: {{{TRACK}}} by {{{ARTIST_NAME}}}",
      html=layout("New demo from {{{ARTIST_NAME}}}", "<p style=\"margin:0\">Reply to this email to answer the artist directly.</p>" + rows([("Artist","ARTIST_NAME"),("Email","SENDER_EMAIL"),("Track","TRACK"),("Listening link","LINK"),("Message","MESSAGE")])),
      variables=[var("ARTIST_NAME"),var("SENDER_EMAIL"),var("TRACK"),var("LINK"),var("MESSAGE",True)]),
 dict(alias="demo-confirmation", name="Demo submission (receipt to the artist)", from_=MAIL_FROM,
      subject="We received your demo",
      html=layout("Thanks for your demo, {{{ARTIST_NAME}}}", "<p style=\"margin:0 0 12px\">We received <strong style=\"color:#F3EFE4\">{{{TRACK}}}</strong>. We listen to everything and get back to you if the sound speaks to us.</p><p style=\"margin:0\">Meanwhile, have a listen to what the label releases.</p>", ("Our releases","https://transubtil-record.com/releases")),
      variables=[var("ARTIST_NAME"),var("TRACK")]),
 dict(alias="contact-notification", name="Contact message (to the label)", from_=MAIL_FROM,
      subject="Contact ({{{SUBJECT}}}) from {{{NAME}}}",
      html=layout("New message: {{{SUBJECT}}}", "<p style=\"margin:0\">Reply to this email to answer directly.</p>" + rows([("Subject","SUBJECT"),("Name","NAME"),("Email","SENDER_EMAIL"),("Message","MESSAGE")])),
      variables=[var("SUBJECT"),var("NAME"),var("SENDER_EMAIL"),var("MESSAGE")]),
 dict(alias="contact-confirmation", name="Contact message (receipt to the sender)", from_=MAIL_FROM,
      subject="We received your message",
      html=layout("Thanks, {{{NAME}}}", "<p style=\"margin:0\">We received your message and will reply within a few days.</p>"),
      variables=[var("NAME")]),
 dict(alias="newsletter-confirm", name="Newsletter: confirm subscription", from_=NEWS_FROM,
      subject="Confirm your subscription to Transubtil Records",
      html=layout("One click to confirm", "<p style=\"margin:0 0 12px\">Confirm your email to get releases, gifts and free downloads from Transubtil Records.</p><p style=\"margin:0;color:#A8A5B0;font-size:13px\">If you didn't ask for this, just ignore this email.</p>", ("Confirm my subscription","{{{CONFIRM_URL}}}")),
      variables=[var("CONFIRM_URL")]),
]
out = {}
for t in templates:
    body = {"name": t["name"], "from": t["from_"], "subject": t["subject"], "html": t["html"], "variables": t["variables"]}
    r = api("PATCH", f"/templates/{t['alias']}", body)
    p = api("POST", f"/templates/{t['alias']}/publish") if not r.get("error") else None
    out[t["alias"]] = "ok" if (not r.get("error") and p and not p.get("error")) else {"update": r, "publish": p}
print(json.dumps(out, indent=1))
