"use client";

import React from 'react';

export function Logo3D() {
	return (
		<div className="logo-3d-wrapper">
			<img
				src="/assets/imagens/logo-3d.png"
				alt="Ferribor - Artefatos de Borracha"
				className="logo-3d-img"
				draggable={false}
			/>

			<style jsx>{`
				.logo-3d-wrapper {
					position: relative;
					flex-shrink: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.18));
					transition: transform 0.3s ease, filter 0.3s ease;
				}
				.logo-3d-wrapper:hover {
					transform: scale(1.04);
					filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25));
				}
				.logo-3d-img {
					height: 80px;
					width: auto;
					object-fit: contain;
					user-select: none;
					pointer-events: none;
				}

				/* Tablet */
				@media (min-width: 768px) {
					.logo-3d-img {
						height: 110px;
					}
				}

				/* Desktop */
				@media (min-width: 1024px) {
					.logo-3d-img {
						height: 145px;
					}
				}

				/* Desktop grande */
				@media (min-width: 1440px) {
					.logo-3d-img {
						height: 165px;
					}
				}
			`}</style>
		</div>
	);
}
