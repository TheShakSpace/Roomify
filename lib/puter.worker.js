const PROJECT_PREFIX = 'roomify_project_';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

const jsonError = (status, message, extra = {}) => {
return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
        }
    })
}

// Handle CORS preflight for all /api/projects/* routes.
router.options('/api/projects/:path*', async () => {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
});

// Also handle bare OPTIONS on each explicit route (some routers don’t match wildcard).
router.options('/api/projects/save', async () => {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
});
router.options('/api/projects/list', async () => {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
});
router.options('/api/projects/get', async () => {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
});


const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch {
        return null;
    }
}

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication failed');

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

return new Response(JSON.stringify({ saved: true, id: project.id, project: payload }), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
            }
        })

    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true))
            .map(({value}) => ({ ...value, isPublic: true }))

return new Response(JSON.stringify({ projects }), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
            }
        });

    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

return new Response(JSON.stringify({ project }), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
            }
        });

    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
})
