import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// 🚩 FIX: Disable CSRF origin check to allow GoDaddy Iframe submissions
		csrf: {
			checkOrigin: false,
		},
		
		// Static adapter for deployment to any static host
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'app.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		},
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$services: 'src/lib/services',
			$config: 'src/lib/config',
			$types: 'src/lib/types'
		}
	}
};

export default config;
