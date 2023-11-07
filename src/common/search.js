export class search {
    constructor(hostname = 'api.campuswire.com', secure = true) {
        this.hostname = hostname;
        this.path = '/v1/group/c4260366-bd77-4fd8-9482-1081895e7ad6/search';
        this.proto = secure ? 'https' : 'http';
    }

    async getSearchTerms(word) {
        let p = new URLSearchParams({query: word});
        const url = new URL(`${this.proto}://${this.hostname}${this.path}?${p.toString()}`);
        const headers = new Headers();
        headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDYW1wdXN3aXJlLUJhY2tlbmQiLCJzdWIiOiI4NDc4M2I4MC01N2ExLTRkYTktOGYxMi1hMTY4MmVjMjM0ZjkiLCJhdWQiOlsiMmRmNjY1NzgtZmM4YS00MDM4LWE2ZDgtNzI0NjBjNDM4M2JlIl0sImV4cCI6MTcwMDUzMjU1MSwibmJmIjoxNjk5MzIyOTUxLCJpYXQiOjE2OTkzMjI5NTF9.2pD8kBFbRUvfs9DUUTbKDlR4Z9d-0Q4ui9AxQUr5AT8'); // Replace with your access token
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
        const body = await fetchResult.text();
        if (body.length == 0) {
            throw new Error("No Result");
        }
        console.log(body);
        return body;
    }
}
