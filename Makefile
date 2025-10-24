.PHONY: tailwind, hugo, clean, serve, minify, cname

clean:
	rm -r public

tailwind:
	npx @tailwindcss/cli  -c ./tailwind.config.js -i ./themes/bileygr/assets/css/main.css  -o ./themes/bileygr/assets/css/output.css

hugo:
	hugo serve -DF --noHTTPCache

serve: clean tailwind hugo

minify:  hugo --cleanDestinationDir --minify

cname:
	echo "www.harrysharma.co.uk" > ./public/CNAME
	touch ./public/.nojekyll