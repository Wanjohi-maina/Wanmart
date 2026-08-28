export default function Footer () {
    return (
        <footer className="border-t border-gray-200 mt-12">
                <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 text-center">
                    © {new Date().getFullYear()} wanmart. All Rights Reserved.
                </div>
            </footer>
    )
}