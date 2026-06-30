import React from 'react';

export function Logo3D() {
	return (
		<div className="relative flex-shrink-0 flex items-center justify-center">
			<img
				src="/assets/imagens/logo-3d.webp"
				alt="Ferribor - Artefatos de Borracha"
				width={120}
				height={120}
				fetchPriority="high"
				draggable={false}
				className="h-[45px] sm:h-[55px] md:h-[65px] lg:h-[80px] w-auto object-contain select-none pointer-events-none"
			/>
		</div>
	);
}
