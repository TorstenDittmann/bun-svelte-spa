<script>
	// Simple reactive state
	let isVisible = $state(false);
	let email = $state("");

	// Simulate page load animation
	$effect(() => {
		setTimeout(() => isVisible = true, 100);
	});

	function handleSubmit() {
		console.log("Email submitted:", email);
		// Add your email signup logic here
	}
</script>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
	<div class="absolute inset-0">
		<div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5">
		</div>
		<div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl">
		</div>
	</div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
		<div class="text-center {isVisible ? 'animate-fade-in' : 'opacity-0'}">
			<div class="mb-6">
				<span
					class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
				>
					⚡ New Framework
				</span>
			</div>

			<h1 class="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
				Build faster with
				<span
					class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
				>
					Svelte + Bun
				</span>
			</h1>

			<p class="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
				The ultimate developer experience. Lightning-fast builds, modern
				reactive UI, and zero-config setup. Start building
				production-ready apps in seconds.
			</p>

			<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<a
					href="https://github.com"
					class="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
				>
					<svg
						class="w-5 h-5 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
						>
						</path>
					</svg>
					Get Started
				</a>
				<button class="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
					<svg
						class="w-5 h-5 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
						>
						</path>
					</svg>
					Watch Demo
				</button>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="py-12 bg-white border-t border-gray-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
			<div>
				<div class="text-3xl font-bold text-indigo-600">10x</div>
				<div class="text-sm text-gray-600 mt-1">Faster builds</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-indigo-600">0</div>
				<div class="text-sm text-gray-600 mt-1">Config required</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-indigo-600">3.2s</div>
				<div class="text-sm text-gray-600 mt-1">Cold start</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-indigo-600">95%</div>
				<div class="text-sm text-gray-600 mt-1">Less bundle size</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-24 bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Everything you need to ship fast
			</h2>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Built for modern developers who want speed without sacrificing
				developer experience
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
				<div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						>
						</path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">
					Lightning Fast Runtime
				</h3>
				<p class="text-gray-600 leading-relaxed">
					Powered by Bun's ultra-fast JavaScript runtime. Experience
					instant hot reloads and blazing build times.
				</p>
			</div>

			<div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
				<div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						>
						</path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">
					Modern Svelte 5
				</h3>
				<p class="text-gray-600 leading-relaxed">
					Built on Svelte 5 with runes, offering the most intuitive
					and performant reactive programming model.
				</p>
			</div>

			<div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
				<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
						>
						</path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">
					Zero Config Setup
				</h3>
				<p class="text-gray-600 leading-relaxed">
					Start building immediately with our opinionated setup.
					Tailwind CSS, TypeScript, and routing work out of the box.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
	<div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
			Ready to build something amazing?
		</h2>
		<p class="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
			Join thousands of developers who are already building faster with
			our modern stack.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a
				href="https://github.com"
				class="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-xl text-white hover:bg-white hover:text-indigo-600 transition-all duration-200"
			>
				Start Building Now
			</a>
		</div>
	</div>
</section>

<style>
@keyframes fade-in {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in {
	animation: fade-in 0.6s ease-out;
}
</style>
