import { useState } from 'react'
export default function NewsletterSignup() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        if (email.trim() === '') return

        setSubmitted(true)
        setEmail('')
    }

    return (
        <section className="bg-gray-50 border-t border-gray-100 px-4 py-14 sm:py-20">
            <div className="max-w-lg mx-auto text-center">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                    Stay in the loop
                </h2>

                <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Get updates on new arrivals and occasional offers.
                </p>

                {submitted ? (
                    <p className="mt-6 text-sm font-medium text-gray-900">
                        You're subscribed — thanks for joining.
                    </p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 flex flex-col sm:flex-row gap-3"
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
                            className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />

                        <button
                            type="submit"
                            className="bg-gray-900 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
            </div>
        </section>
    )
}