const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDYW1wdXN3aXJlLUJhY2tlbmQiLCJzdWIiOiI4NDc4M2I4MC01N2ExLTRkYTktOGYxMi1hMTY4MmVjMjM0ZjkiLCJhdWQiOlsiMmRmNjY1NzgtZmM4YS00MDM4LWE2ZDgtNzI0NjBjNDM4M2JlIl0sImV4cCI6MTcwMDUzMjU1MSwibmJmIjoxNjk5MzIyOTUxLCJpYXQiOjE2OTkzMjI5NTF9.2pD8kBFbRUvfs9DUUTbKDlR4Z9d-0Q4ui9AxQUr5AT8";
const DEFAULT_GROUP_ID = 'c4260366-bd77-4fd8-9482-1081895e7ad6';
const DEFAULT_HOSTNAME = 'api.campuswire.com';

export class CampusWireApi {
    constructor(bearerToken = null, hostname = DEFAULT_HOSTNAME, secure = true) {
        this.hostname = hostname;
        this.proto = secure ? 'https' : 'http';
        this.token = bearerToken || DEFAULT_TOKEN;
    }

    get authorization() {
        return `Bearer ${this.token}`;
    }

    async search(query, groupId = null) {
        let p = new URLSearchParams({query});
        const path = `/v1/group/${groupId}/search?${p.toString()}`;
        const url = new URL(path, `${this.proto}://${this.hostname}`);
        const headers = new Headers();

        headers.append('Authorization', this.authorization);
        headers.append('Accept', 'application/json, text/plain, */*');
        headers.append('Referer', 'https://campuswire.com');
        headers.append('Sec-Ch-Ua', '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"');
        headers.append('Sec-Ch-Ua-Mobile', '?0');
        headers.append('Sec-Ch-Ua-Platform', '"macOS"');
        headers.append('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');

        const fetchResult = await fetch(url, {
            method: 'GET', // Or any other method you want to use
            headers: headers,
        });
        if (!fetchResult.ok) return null;

        const jsonData = await fetchResult.json();
        const { posts = [] } = jsonData;
        // Extracting desired information for each post
        return posts.map((post,index) => ({
            title: post.title.replaceAll('==', ''),
            postNumber: post.number,
            body: post.body.replaceAll('==', ''),
            id: post.id,
            groupId: post.group,
            publishedAt: new Date(post.publishedAt),
            url:`https://campuswire.com/c/G${(post.group.split('-'))[0].toUpperCase()}/feed/${post.number}`,
        }));
    }
}
