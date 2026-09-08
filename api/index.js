// Open WebUI boot endpoints for the static deployment.
//
// The desktop hosts the real Open WebUI frontend (open-webui/open-webui) but
// there is no Python backend on a static site, so this function answers the
// handful of calls the app makes at start-up: auth off, one local user, empty
// collections. Nothing is stored and nothing is proxied.
const USER = {
    id: 'aditya',
    email: 'aditya@localhost',
    name: 'Aditya',
    role: 'admin',
    profile_image_url: '/static/favicon.png',
    token: 'static',
    token_type: 'Bearer',
    permissions: {},
};

const CONFIG = {
    status: true,
    name: 'Aditya WebUI',
    version: '0.11.3',
    default_locale: 'en-US',
    oauth: { providers: {} },
    features: {
        auth: false,
        auth_trusted_header: false,
        enable_ldap: false,
        enable_api_key: false,
        enable_signup: false,
        enable_login_form: false,
        enable_web_search: false,
        enable_image_generation: false,
        enable_admin_export: false,
        enable_admin_chat_access: false,
        enable_community_sharing: false,
        enable_autocomplete_generation: false,
        enable_direct_connections: false,
        enable_channels: false,
        enable_notes: false,
        enable_google_drive_integration: false,
        enable_onedrive_integration: false,
        enable_version_update_check: false,
    },
    default_models: null,
    default_prompt_suggestions: [],
    audio: { tts: { engine: '', voice: '', split_on: 'punctuation' }, stt: { engine: '' } },
    file: { max_size: null, max_count: null },
    permissions: {
        workspace: { models: false, knowledge: false, prompts: false, tools: false },
        chat: { controls: true, file_upload: false, delete: true, edit: true, temporary: true },
        features: { web_search: false, image_generation: false, code_interpreter: false },
    },
    google_drive: { client_id: '', api_key: '' },
    onedrive: { client_id: '', sharepoint_url: '', sharepoint_tenant_id: '' },
    ui: { pending_user_overlay_title: '', pending_user_overlay_content: '' },
    license_metadata: null,
};

module.exports = (req, res) => {
    const path = (req.url || '').split('?')[0].replace('/desktop/openwebui', '');
    res.setHeader('Content-Type', 'application/json');

    if (path.endsWith('/api/config')) return res.end(JSON.stringify(CONFIG));
    if (path.endsWith('/api/version')) return res.end(JSON.stringify({ version: '0.11.3' }));
    if (path.endsWith('/api/version/updates')) return res.end(JSON.stringify({ current: '0.11.3', latest: '0.11.3' }));
    if (path.endsWith('/api/changelog')) return res.end(JSON.stringify({}));
    if (path.endsWith('/api/webhook')) return res.end(JSON.stringify({ url: '' }));
    if (path.endsWith('/api/models') || path.endsWith('/api/models/base')) return res.end(JSON.stringify({ data: [] }));
    if (path.includes('/api/v1/auths')) return res.end(JSON.stringify(USER));
    if (path.includes('/api/v1/users/user/settings')) return res.end(JSON.stringify({ ui: {} }));
    if (path.includes('/ollama/api/version')) return res.end(JSON.stringify({ version: '' }));

    // Every other collection the dashboard asks for is simply empty.
    return res.end(JSON.stringify([]));
};
