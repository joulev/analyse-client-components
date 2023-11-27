# analyse-client-components

Check whether a file is included in the client bundle or not for the Next.js App Router. **Only supports Next.js projects written with TypeScript!**

```bash
npx @joulev/analyse-client-components@latest ./path/to/file...
```

From the root of the Next.js app (same folder as `package.json`), run the command for any files that are server components by default (e.g. `layout.tsx` and `page.tsx` files). You will get an output that looks like this (run on [this file](<https://github.com/joulev/website/blob/69bde83778b9d23d452d74bd995e54a0bc627696/src/app/(public)/(home)/page.tsx>)):

```
$ npx @joulev/analyse-client-components@latest src/app/\(public\)/\(home\)/page.tsx

  src/app/(public)/(home)/page.tsx
    src/lib/cn.ts
    src/app/(public)/(home)/page.module.css
    src/components/ui/card.tsx
      src/lib/cn.ts
|   src/components/ui/lists.tsx
|     src/lib/cn.ts
|     src/components/ui/hooks/use-hover-background.ts
|     src/types/utils.ts
    src/components/ui/link.tsx
      src/lib/cn.ts
|   src/components/ui/button.tsx
|     src/lib/cn.ts
|     src/components/ui/hooks/use-hover-background.ts
|     src/components/ui/link.tsx
|       src/lib/cn.ts
    src/app/(public)/(home)/get-github-readme.ts
      src/app/(public)/(home)/octokit.ts
        src/env.mjs
    src/app/(public)/(home)/music-data.tsx
      src/env.mjs
      src/app/(public)/(home)/metadata-card.tsx
|       src/components/ui/button.tsx
|         src/lib/cn.ts
|         src/components/ui/hooks/use-hover-background.ts
|         src/components/ui/link.tsx
|           src/lib/cn.ts
    src/app/(public)/(home)/github-stats.tsx
      src/app/(public)/(home)/octokit.ts
        src/env.mjs
      src/app/(public)/(home)/metadata-card.tsx
|       src/components/ui/button.tsx
|         src/lib/cn.ts
|         src/components/ui/hooks/use-hover-background.ts
|         src/components/ui/link.tsx
|           src/lib/cn.ts
```

Files starting with the `|` are imported to at least one file with `"use client"` hence will be added to the client bundle. Other files are not added to the client bundle.

For example in the above, since `src/lib/cn.ts` has at least one entry with the `|`, it is available in the client bundle for `src/app/(public)/(home)/page.tsx`, whlie `src/app/(public)/(home)/music-data.tsx` doesn't have any entries with the `|`, the logic in that file stays in the server.

## Installation and usage

### Run directly with `npx` and similar commands (recommended)

As shown above, you can run it directly with

```bash
npx @joulev/analyse-client-components@latest ./path/to/file...
# or yarn dlx or pnpx
```

### Install globally

```bash
npm install -g @joulev/analyse-client-components

# then
analyse-client-components ./path/to/file...
# or
acc ./path/to/file...
```

### Install locally

```bash
npm install --save-dev @joulev/analyse-client-components
```

then add the CLI to `package.json` scripts:

```js
{
  "scripts": {
    "acc": "acc"
    // other scripts, like "build": "next build"
  }
}
```

then run `npm run acc` or similar commands.

```bash
npm run acc -- ./path/to/file...
```

## Programmatical usage

No.

Only use this as a CLI tool.

## Notes

This is a project I finished in like one hour or two. It is very minimal and assumes the user uses it exactly according to the guide above (namely, it is run in the root of the Next.js app, it references a file that Next.js treats as a server component by default). There is no error handling here, I made this mainly for my own use so I'm too lazy to add sufficient error handlings. So yes, this tool could work but also could blow up if you use it in any ways not described in the guide above.
