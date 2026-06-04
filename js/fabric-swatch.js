document.addEventListener('DOMContentLoaded', () => {

    const btn =
        document.getElementById('fabricSwatchBtn');

    if (!btn) return;

    btn.addEventListener('click', () => {

        const productTitle =
            document.querySelector('.product-details-col h2')
            ?.textContent
            ?.trim() || 'Uniform';

        const message =
            `I would like a fabric swatch for ${productTitle}.`;

        const whatsapp =
            `https://wa.me/919940666626?text=${encodeURIComponent(message)}`;

        window.open(whatsapp, '_blank');

    });

});