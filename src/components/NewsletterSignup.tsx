import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function NewsletterSignup() {
    const [email, setEmail] = useState('')
    const [trap, setTrap] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        if (email.trim() === '') return

        // Bots fill in hidden fields. Pretend it worked and save nothing.
        if (trap !== '') {
            setStatus('done')
            return
        }

        setStatus('sending')

        const { error: rpcError } = await supabase.rpc('subscribe_newsletter', {
            p_email: email.trim(),
        })

        if (rpcError) {
            setStatus('idle')
            setError(
                rpcError.message.includes('valid email')
                    ? 'Please enter a valid email address.'
                    : 'Something went wrong. Please try again.',
            )
            return
        }

        setEmail('')
        setStatus('done')
    }

    return (
        <section className="bg-white border-t border-gray-100 px-4 py-14 sm:py-20">
            <div className="max-w-lg mx-auto text-center">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                    Stay in the loop
                </h2>

                <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Get updates on new arrivals and occasional offers.
                </p>

                {status === 'done' ? (
                    <p
                        className="mt-6 text-sm font-medium text-gray-900"
                        role="status"
                    >
                        Thanks. We've saved your email.
                    </p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 flex flex-col sm:flex-row gap-3"
                        noValidate
                    >
                        <label
                            htmlFor="newsletter-email"
                            className="sr-only"
                        >
                            Email address
                        </label>

                        <input
                            id="newsletter-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@gmail.com"
                            autoComplete="email"
                            disabled={status === 'sending'}
                            className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-base sm:text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
                        />

                        {/* Hidden from people. Bots tend to fill it in. */}
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="newsletter-website">Website</label>
                            <input
                                id="newsletter-website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={trap}
                                onChange={(e) => setTrap(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="bg-orange-600 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-orange-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {status === 'sending' ? 'Saving...' : 'Subscribe'}
                        </button>
                    </form>
                )}

                {error && (
                    <p className="mt-3 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                {status !== 'done' && (
                    <p className="mt-3 text-xs text-gray-400">
                        We'll only send occasional updates. You can unsubscribe
                        at any time.
                    </p>
                )}
            </div>
        </section>
    )
}