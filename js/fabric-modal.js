document.addEventListener('DOMContentLoaded', () => {

    const modal =
        document.getElementById('fabricModal');

    const modalImage =
        document.getElementById('fabricModalImage');

    const closeBtn =
        document.getElementById('fabricModalClose');

    const fabricThumb =
        document.querySelector('.fabric-thumb img');

    if (!modal || !fabricThumb) return;

    fabricThumb.addEventListener('dblclick', () => {

        modalImage.src =
            fabricThumb.dataset.full;

        modal.classList.add('active');

    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', e => {

        if (
            e.target.classList.contains('fabric-modal') ||
            e.target.classList.contains('fabric-modal-overlay')
        ) {
            modal.classList.remove('active');
        }

    });

    document.addEventListener('keydown', e => {

        if (e.key === 'Escape') {
            modal.classList.remove('active');
        }

    });

});