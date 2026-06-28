import React from 'react';

export function Logo3D() {
	return (
		<div className="relative flex-shrink-0 flex items-center justify-center">
			<img
				src="/assets/imagens/logo-3d.png"
				alt="Ferribor - Artefatos de Borracha"
				width={120}
				height={120}
				draggable={false}
				className="h-[80px] md:h-[100px] lg:h-[120px] w-auto object-contain select-none pointer-events-none"
			/>
		</div>
	);
}
