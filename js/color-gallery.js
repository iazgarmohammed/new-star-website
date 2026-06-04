document.addEventListener('DOMContentLoaded', () => {

    const swatches =
        document.querySelectorAll('.color-swatch');

    const mainImage =
        document.getElementById('mainProductImage');

    const thumbs =
        document.querySelectorAll('.gallery-thumb img');

    swatches.forEach(swatch => {

        swatch.addEventListener('click', () => {

            const color =
                swatch.dataset.color;

            mainImage.src =
                `../images/products/scrubs/${color}-main.png`;

            thumbs[0].src =
                `../images/products/scrubs/${color}-front.png`;

            thumbs[0].dataset.full =
                `../images/products/scrubs/${color}-front.png`;

            thumbs[1].src =
                `../images/products/scrubs/${color}-back.png`;

            thumbs[1].dataset.full =
                `../images/products/scrubs/${color}-back.png`;

            thumbs[2].src =
                `../images/products/scrubs/${color}-fabric.png`;

            thumbs[2].dataset.full =
                `../images/products/scrubs/${color}-fabric.png`;

            thumbs[3].src =
                `../images/products/scrubs/${color}-logo.png`;

            thumbs[3].dataset.full =
                `../images/products/scrubs/${color}-logo.png`;

        });

    });

});