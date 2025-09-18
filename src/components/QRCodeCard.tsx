import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function QRCodeCard({ text }: { text: string }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	
	// Safe clipboard copy function
	const copyToClipboard = async (text: string) => {
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(text);
			} else {
				// Fallback for older browsers or non-secure contexts
				const textArea = document.createElement('textarea');
				textArea.value = text;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				textArea.remove();
			}
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	useEffect(() => {
		if (!canvasRef.current) return
		QRCode.toCanvas(canvasRef.current, text, { width: 200, margin: 1, color: { light: '#ffffff', dark: '#000000' } })
	}, [text])
	return (
		<div className="p-4 border border-white/10 dark:border-white/10 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-md shadow-lg">
			<div className="flex flex-col items-center gap-3">
				<div className="p-2 bg-white rounded-lg shadow-sm">
					<canvas ref={canvasRef} className="rounded-md" />
				</div>
				<div className="text-xs text-gray-600 dark:text-gray-300 break-all max-w-[200px] text-center font-mono">
					{text}
				</div>
				<button 
					onClick={() => copyToClipboard(text)}
					className="px-3 py-1.5 bg-indigo-600/20 backdrop-blur-md border border-indigo-400/30 hover:bg-indigo-600/30 hover:border-indigo-400/50 text-white rounded-md text-xs font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
				>
					Copy Link
				</button>
			</div>
		</div>
	)
}
