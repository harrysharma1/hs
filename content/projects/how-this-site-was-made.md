+++
date = '2025-10-24T12:49:55+01:00'
draft = false
title = 'How This Site Was Made'
tags = ['development','go','hugo']
+++
# How This Site Was Made
---
## Hugo
### What is Hugo?
Hugo is a static site generator, which makes development of sites like portfolio ones very simple. Again this is a portfolio site with a blog element. I do not need to over-engineer a solution.

### What I like about it?
I do not need to come up with a back end solution for something like this. Routing is handled through the layout directory, no data store solutions are required as markdown in the content directory get's rendered onto the page. The minimal reactivity is introduced with JS.

## Why the blog?
It seems the tech job market is cooked, I hope writing explainations to my side projects will help me articulate my thought process better. Hopefully, I can practice my systems design skills by giving reasons for design choices for these projects

## File Tree
```
.
├── archetypes
│   └── default.md
├── assets
│   └── README.md
├── content
│   ├── blog
│   │   └── _index.md
│   ├── posts
│   │   ├── _index.md
│   │   └── hello-world.md
│   └── projects
│       ├── _index.md
│       └── how-this-site-was-made.md
├── data
├── hugo.toml
├── i18n
├── layouts
├── Makefile
├── package-lock.json
├── package.json
├── README.md
├── static
├── tailwind.config.js
└── themes
    └── bileygr
        ├── assets
        │   ├── css
        │   │   ├── main.css
        │   │   └── output.css
        │   └── js
        │       └── main.js
        ├── config.toml
        ├── data
        ├── i18n
        ├── layouts
        │   ├── _default
        │   │   ├── baseof.html
        │   │   ├── home.jsondates.json
        │   │   ├── index.jsonfeed.json
        │   │   ├── list.html
        │   │   ├── single.html
        │   │   ├── term.html
        │   │   └── terms.html
        │   ├── _partials
        │   │   ├── footer.html
        │   │   ├── head
        │   │   │   ├── css.html
        │   │   │   └── js.html
        │   │   ├── head.html
        │   │   ├── header.html
        │   │   ├── navbar.html
        │   │   ├── pagination.html
        │   │   └── profile.html
        │   ├── _shortcodes
        │   │   ├── project.html
        │   │   └── socials.html
        │   └── index.html
        └── static
            ├── android-chrome-192x192.png
            ├── android-chrome-512x512.png
            ├── apple-touch-icon.png
            ├── favicon-16x16.png
            ├── favicon-32x32.png
            ├── favicon.ico
            ├── harry_cv.pdf
            └── yhwach.jpg
```
### Root
**NOTE: This will override the `themes` directory.**
- `archetypes/default.md`: This is the default template that is generated when you run the  `hugo new content <name>` command.
- `assets/`: Stores any assets that may be used within the website.
- `content`: This is where the generated markdown will be put when you put `hugo new content <name>`.
- `data/`: Storing of data files for access in template. 
- `hugo.toml`: Where site config is set.
- `i18n/`: For internationalisation, which I will not be doing (out of scope).
- `layouts/`: The `.html` layout for rendered markdown.
- `package-lock.json`/`package.json`: node modules requirements.
- `static/`: Storing of static files for access in template e.g. `favicon.ico`.
- `tailwind.config.js`: Provides tailwind files to watch for when generating CSS files.

### Themes
This will be similar to the root but will be where I put all my styling/themes. This modularity allows you to add various themes to your site with ease.

For modularity sakes to override this them you could copy the contents of the `config.toml` file:
```toml
[params]
    author = "Harry Sharma"
    username = "harrysharma1"
    githubUrl = "https://github.com/harrysharma1"
    location = "Northampton, England"
    quote = "Job market is cooked, and so am I..."
    emails = ["harrysharma1066@gmail.com","inquiry@harrysharma.co.uk"]
    profileImgSrc = "yhwach.jpg"
    cvSrc = "harry_cv.pdf"
    [[params.socials]]
        name = "LinkedIn"
        icon = "bi bi-linkedin"
        url = "https://www.linkedin.com/in/harry-sharma-567b21225"
    [[params.socials]]
        name = "Pintrest"
        icon = "bi bi-pinterest"
        url = "https://www.pinterest.com/harrysharma1066"
    [[params.socials]]
        name = "Goodreads"
        icon = "bi bi-book"
        url = "https://www.goodreads.com/user/show/184799979-harry"
    [[params.socials]]
        name = "Substack"
        icon = "bi bi-substack"
        url = "https://substack.com/@harrysharma1?utm_campaign=profile&utm_medium=profile-page"
```
Putting this in the root `hugo.toml` file will override said values in the theme. For profile and cv, just put it in the root `static/` directory and change the names in the config to those of the file and it should change. More features will be added later and I will get this theme into its own git repo so others can use it. 

## Makefile
```makefile
.PHONY: tailwind, hugo, clean, serve, minify, cname

clean:
	rm -r public

tailwind:
	npx @tailwindcss/cli\
        -c ./tailwind.config.js\
        -i ./themes/bileygr/assets/css/main.css\
        -o ./themes/bileygr/assets/css/output.css

hugo:
	hugo serve -DF --noHTTPCache

serve: clean tailwind hugo

minify:  hugo --cleanDestinationDir --minify

cname:
	echo "www.harrysharma.co.uk" > ./public/CNAME
	touch ./public/.nojekyll
```

This generates repeatable commands that were used within development of the project:

- `make clean`: This was simply removing the public directory which get's generated when running the `hugo serve command`.
- `make tailwind`: This uses the `@tailwindcss/cli` installed by `npm` to first take the config set within `tailwind.config.js` (in hindsight this should also be moved into themes) and then takes the input `./themes/bileygr/assets/css/main.css` file. It will then generate the corresponding CSS classes in `./themes/bileygr/assets/css/output.css` for the tailwind you used within your HTML. This can cause an issue where the live reload may not pick up a new tailwind class if it does not exist in `output.css`.
- `make hugo`: This serves the site locally. `-DF` renders drafts as well as any content with a future date (through manual alteration). `--noHTTPCache` prevents any caching issues when serving the dev site.
- `make serve`: This chains the above commands (note: if you ran clean or deleted public it will fail, still figuring out makefiles).
- `make minify`: This is to create a smaller public package *(for deployment)*.
- `make cname`: Adding URL CNAME entry *(for deployment)*.

## Deployment
I used the [following medium article](https://emilymdubois.medium.com/using-a-squarespace-domain-with-github-pages-438951d4f5b7) and the [hugo documentation](https://gohugo.io/host-and-deploy/host-on-github-pages) to help deploy this site through Github pages to a custom domain.

---
## Repo

[harrysharma1/hs](https://github.com/harrysharma1/hs/tree/main)

---
## Citations
1. [Hugo documentation](https://gohugo.io/)
2. [CalHeatmap documentation](https://cal-heatmap.com)
3. [Tailwind documentation](https://tailwindcss.com)
4. [Use a Squarespace domain with GitHub Pages](https://emilymdubois.medium.com/using-a-squarespace-domain-with-github-pages-438951d4f5b7)