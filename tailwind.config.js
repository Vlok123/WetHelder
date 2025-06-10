/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			gray: {
  				750: '#374151',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  			mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			bounce: {
  				'0%, 100%': {
  					transform: 'translateY(-25%)',
  					animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
  				},
  				'50%': {
  					transform: 'translateY(0)',
  					animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
  				},
  			},
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'slide-in': {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			bounce: 'bounce 1s infinite',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'slide-in': 'slide-in 0.3s ease-out',
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: 'none',
  					color: 'inherit',
  					p: {
  						marginTop: '0.5rem',
  						marginBottom: '0.5rem',
  					},
  					h1: {
  						color: 'inherit',
  					},
  					h2: {
  						color: 'inherit',
  					},
  					h3: {
  						color: 'inherit',
  					},
  					h4: {
  						color: 'inherit',
  					},
  					strong: {
  						color: 'inherit',
  					},
  					a: {
  						color: 'inherit',
  						textDecoration: 'underline',
  						'&:hover': {
  							color: 'inherit',
  						},
  					},
  				},
  			},
  			invert: {
  				css: {
  					'--tw-prose-body': 'white',
  					'--tw-prose-headings': 'white',
  					'--tw-prose-lead': 'white',
  					'--tw-prose-links': 'white',
  					'--tw-prose-bold': 'white',
  					'--tw-prose-counters': 'white',
  					'--tw-prose-bullets': 'white',
  					'--tw-prose-hr': 'white',
  					'--tw-prose-quotes': 'white',
  					'--tw-prose-quote-borders': 'white',
  					'--tw-prose-captions': 'white',
  					'--tw-prose-code': 'white',
  					'--tw-prose-pre-code': 'white',
  					'--tw-prose-pre-bg': 'white',
  					'--tw-prose-th-borders': 'white',
  					'--tw-prose-td-borders': 'white',
  				},
  			},
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    ...(process.env.NODE_ENV === 'production' ? [] : [require("@tailwindcss/typography")]),
  ],
} 