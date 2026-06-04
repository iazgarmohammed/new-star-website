function syncOrderSummary() {

    const totalUnits = document.getElementById('totalUnits');
    const summaryUnits = document.getElementById('summaryTotalUnits');

    if (!totalUnits || !summaryUnits) return;

    const observer = new MutationObserver(() => {
        summaryUnits.textContent = totalUnits.textContent;
    });

    observer.observe(totalUnits, {
        childList: true,
        subtree: true,
        characterData: true
    });

    summaryUnits.textContent = totalUnits.textContent;
}

document.addEventListener('DOMContentLoaded', syncOrderSummary);