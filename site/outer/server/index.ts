const express = require('express');
const path = require('path');
const cors = require('cors');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const compression = require('compression');

const app = express();
const port = 8080;

app.use(cors());
app.use(compression());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// ---------------------------------------------------------------------------
// Open WebUI (open-webui/open-webui) ships as a frontend + Python backend. The
// desktop hosts the real frontend build at /desktop/openwebui and this router
// answers the handful of boot endpoints it needs, so the UI comes up fully
// (no "Backend Required" screen) with auth off and no models attached.
// ---------------------------------------------------------------------------
// The Open WebUI build (SvelteKit) references its assets from the server root,
// so mount them there while the page itself is served under /desktop/openwebui.
const owuiRoot = path.resolve(__dirname, '../public/desktop/openwebui');
app.use('/static', express.static(path.join(owuiRoot, 'static')));

const OWUI_USER = {
    id: 'aditya',
    email: 'aditya@localhost',
    name: 'Aditya',
    role: 'admin',
    profile_image_url: '/static/favicon.png',
    token: 'static',
    token_type: 'Bearer',
    permissions: {},
};

const owuiConfig = {
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

const owuiEmpty = (_req, res) => res.json([]);

const owuiRoute = (p) => ['/api' + p, '/desktop/openwebui/api' + p];
app.get(owuiRoute('/config'), (_req, res) => res.json(owuiConfig));
app.get(owuiRoute('/version'), (_req, res) => res.json({ version: '0.11.3' }));
app.get(owuiRoute('/version/updates'), (_req, res) => res.json({ current: '0.11.3', latest: '0.11.3' }));
app.get(owuiRoute('/changelog'), (_req, res) => res.json({}));
app.get(owuiRoute('/webhook'), (_req, res) => res.json({ url: '' }));
app.get(owuiRoute('/models'), (_req, res) => res.json({ data: [] }));
app.get(owuiRoute('/models/base'), (_req, res) => res.json({ data: [] }));
app.get(owuiRoute('/v1/auths/'), (_req, res) => res.json(OWUI_USER));
app.post(owuiRoute('/v1/auths/signin'), (_req, res) => res.json(OWUI_USER));
app.get(owuiRoute('/v1/users/user/settings'), (_req, res) => res.json({ ui: {} }));
app.post(owuiRoute('/v1/users/user/settings/update'), (_req, res) => res.json({ ui: {} }));
app.get(owuiRoute('/v1/chats/'), owuiEmpty);
app.get(owuiRoute('/v1/chats/list'), owuiEmpty);
app.get(owuiRoute('/v1/chats/pinned'), owuiEmpty);
app.get(owuiRoute('/v1/chats/all/tags'), owuiEmpty);
app.get(owuiRoute('/v1/folders/'), owuiEmpty);
app.get(owuiRoute('/v1/channels/'), owuiEmpty);
app.get(owuiRoute('/v1/notes/'), owuiEmpty);
app.get(owuiRoute('/v1/prompts/'), owuiEmpty);
app.get(owuiRoute('/v1/tools/'), owuiEmpty);
app.get(owuiRoute('/v1/functions/'), owuiEmpty);
app.get(owuiRoute('/v1/knowledge/'), owuiEmpty);
app.get(owuiRoute('/v1/models/'), owuiEmpty);
app.get(owuiRoute('/v1/configs/banners'), owuiEmpty);
// SPA fallback: client-side routes such as /desktop/openwebui/auth or /c/<id>
app.get(/^\/desktop\/openwebui\//, (req, res, next) => {
    if (/\.[a-z0-9]+$/i.test(req.path)) return next();
    res.sendFile(path.join(owuiRoot, 'index.html'));
});

app.get('/ollama/api/version', (_req, res) => res.json({ version: '' }));

// Handle GET requests to /api route
app.post(owuiRoute('/send-email'), (req, res) => {
    const { name, company, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.FOLIO_EMAIL,
            pass: process.env.FOLIO_PASSWORD,
        },
    });

    transporter
        .verify()
        .then(() => {
            transporter
                .sendMail({
                    from: `"${name}" <henryheffernan.folio@gmail.com>`, // sender address
                    to: 'henryheffernan@gmail.com, henryheffernan.folio@gmail.com', // list of receivers
                    subject: `${name} <${email}> ${
                        company ? `from ${company}` : ''
                    } submitted a contact form`, // Subject line
                    text: `${message}`, // plain text body
                })
                .then((info) => {
                    console.log({ info });
                    res.json({ message: 'success' });
                })
                .catch((e) => {
                    console.error(e);
                    res.status(500).send(e);
                });
        })
        .catch((e) => {
            console.error(e);
            res.status(500).send(e);
        });
});

// listen to app on port 8080
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
