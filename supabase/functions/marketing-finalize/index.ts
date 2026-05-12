// Fetch DKIM records via the per-domain GET endpoint, fix sender validate body,
// and properly clean up + reinstall the Brevo WP plugin.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const out: any = {};

  const apiKey = Deno.env.get('BREVO_API_KEY')!;
  const bh = { 'api-key': apiKey, 'accept': 'application/json', 'content-type': 'application/json' };

  // 1. Per-domain GET (returns DKIM + Brevo code + DMARC records)
  const dom = await fetch('https://api.brevo.com/v3/senders/domains/gearuptofit.com', { headers: bh });
  out.domain_records = { status: dom.status, body: await dom.text() };

  // 2. Sender validate — Brevo wants empty {} JSON body
  const sList = await fetch('https://api.brevo.com/v3/senders', { headers: bh }).then(r => r.json());
  const sender = (sList.senders || []).find((s: any) => s.email === 'info@gearuptofit.com');
  if (sender) {
    const vr = await fetch(`https://api.brevo.com/v3/senders/${sender.id}/validate`, {
      method: 'PUT', headers: bh, body: '{}',
    });
    out.sender_validate = { id: sender.id, status: vr.status, body: await vr.text() };
  }

  // 3. WP plugin — search and install
  const wpUser = Deno.env.get('WP_USERNAME')!;
  const wpPass = Deno.env.get('WP_APP_PASSWORD')!.replace(/\s+/g, '');
  const wpAuth = 'Basic ' + btoa(`${wpUser}:${wpPass}`);
  const wpBase = Deno.env.get('WP_SITE_URL')!.replace(/\/$/, '');
  const wpH = { Authorization: wpAuth, 'Content-Type': 'application/json' };

  // List ALL plugins (large) — search for brevo/mailin/sendinblue
  const all = await fetch(`${wpBase}/wp-json/wp/v2/plugins`, { headers: wpH });
  const allJson = await all.json().catch(() => []);
  const brevoLike = (Array.isArray(allJson) ? allJson : []).filter((p: any) =>
    /brevo|sendinblue|mailin|newsletter/i.test(p.plugin + ' ' + (p.name || ''))
  );
  out.wp_brevo_like = brevoLike;

  // Delete orphan mailin folder via plugin DELETE if present
  const del = await fetch(`${wpBase}/wp-json/wp/v2/plugins/${encodeURIComponent('mailin/mailin')}`, {
    method: 'DELETE', headers: wpH,
  });
  out.wp_delete_orphan = { status: del.status, body: (await del.text()).slice(0, 200) };

  // Try installing fresh — Brevo plugin slug on wp.org is 'mailin'
  const inst = await fetch(`${wpBase}/wp-json/wp/v2/plugins`, {
    method: 'POST', headers: wpH, body: JSON.stringify({ slug: 'mailin', status: 'active' }),
  });
  out.wp_install = { status: inst.status, body: (await inst.text()).slice(0, 400) };

  return new Response(JSON.stringify(out, null, 2), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
