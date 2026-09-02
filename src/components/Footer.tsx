export default function Footer () {
    return (
        <footer className="border-t border-gray-200 ">
                <div className="max-w-6xl mx-auto p-4 md:py-6 text-sm text-gray-500 text-center">
                    © {new Date().getFullYear()} wanmart. All Rights Reserved.
                </div>
            </footer>
    )
}