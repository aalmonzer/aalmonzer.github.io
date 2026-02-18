// parse frontmatter (the --- block at the top of .md files)
function parseFrontmatter(md) {
    md = md.replace(/\r\n/g, '\n').trim();
    const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: md };

    const meta = {};
    match[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
            meta[key.trim()] = rest.join(':').trim();
        }
    });

    return { meta, body: match[2].trim() };
}

// fetch and parse a single post by slug
async function fetchPost(slug) {
    const res = await fetch(`./posts/${slug}.md`);
    if (!res.ok) return null;
    const text = await res.text();
    const { meta, body } = parseFrontmatter(text);
    return { slug, ...meta, body };
}

// fetch the post list
async function fetchPostList() {
    const res = await fetch('./posts/posts.json');
    return await res.json();
}

// get a plain text preview from markdown (strip markdown syntax)
function getPreview(md, maxLen = 150) {
    const plain = md
        .replace(/^#{1,6}\s+/gm, '')   // headers
        .replace(/\*\*|__/g, '')         // bold
        .replace(/\*|_/g, '')            // italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .replace(/`{1,3}[^`]*`{1,3}/g, '')       // code
        .replace(/^[-*]\s+/gm, '')       // list items
        .replace(/\n+/g, ' ')           // newlines
        .trim();
    return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

// format date nicely
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
