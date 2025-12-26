import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Alpha: Don't prerender catch-all route (*?) - causes Windows filename issues
	// The not-found page will be rendered on-demand
	prerender: [],
} satisfies Config;
