.PHONY: tailwind, hugo, clean, serve

clean:
	rm -r public

tailwind:
	npx @tailwindcss/cli  -c ./tailwind.config.js -i ./themes/bileygr/assets/css/main.css  -o ./themes/bileygr/assets/css/output.css

hugo:
	hugo serve -DF --noHTTPCache

serve: clean tailwind hugo