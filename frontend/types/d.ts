declare module "*.png" {
    const value: any;
    export = value;
}

declare module "*.mp3" {
    const value: any;
    export = value;
}

declare module "eruda" {
    // https://github.com/liriliri/eruda
    const init: (config: {
        container: HTMLElement,
        tool?: string[],
        transparency?: number,
        defaults: {
            displaySize: number;
            transparency: number;
            theme: string;
        }
    }) => any;
}


interface Window { 
    log: typeof console['log'];
}

declare const env: 'dev' | 'prod';
declare const NETLIFY: boolean;
