/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.freepik.com",
				pathname: "**",
			},
		],
	},
};

module.exports = nextConfig;
