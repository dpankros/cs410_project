const synonymResult = /<a\s+href="webwn\?([\w\d]+=[\&\w=]+;)+s=([\w+]+)">([\w\s]+)<\/a>/gi;
const sensesResult = /(<li>.*<\/li>)+?/ig;
const glossResult = /\(([a-z0-9 (),.;]+)\)/ig;

const last = arr => arr.length > 0 ? arr[arr.length - 1] : null;
const first = arr => arr.length > 0 ? arr[0] : null;

class WordNetSynonyms {
    constructor(hostname = 'wordnetweb.princeton.edu', secure = false) {
        this.hostname = hostname;
        this.path = '/perl/webwn';
        this.proto = secure ? 'https' : 'http';
    }

    async synonymFor(word) {
        let p = new URLSearchParams({s: word});
        const url = new URL(`${this.proto}://${this.hostname}${this.path}?${p.toString()}`);

        const fetchResult = await fetch(url);
        const body = await fetchResult.text();
        if (body.length == 0) {
            throw new Error("No Result");
        }
        const resultsBySense = [...sensesResult[Symbol.matchAll](body)];
        const results = [];
        for (let senseNdx = 0; senseNdx < resultsBySense.length; senseNdx++) {
            const senseBody = first(resultsBySense[senseNdx]);
            const gloss = last([...glossResult[Symbol.matchAll](senseBody)])[1];
            const senseMatches = [...synonymResult[Symbol.matchAll](senseBody)];
            results.push({gloss, synonyms: senseMatches.reduce((a, v) => [...a, v[3]], [])});
        }
        return results;
    }


}
