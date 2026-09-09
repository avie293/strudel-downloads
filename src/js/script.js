function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function copyIp(button) {
    const ipBox = button.parentElement.querySelector('.ip-text');
    navigator.clipboard.writeText(ipBox.textContent).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i> Kopiert!';
        setTimeout(() => {
            button.innerHTML = '<i class="fa-regular fa-copy"></i> Kopieren';
        }, 2000);
    });
}

async function fetchServerStatuses() {
    const serverCards = document.querySelectorAll('.server-card');
    
    serverCards.forEach(async (card) => {
        const ip = card.getAttribute('data-ip');
        if (!ip) return;

        const statusBadge = card.querySelector('.server-status-badge');
        const playerCount = card.querySelector('.player-count');
        const serverVersion = card.querySelector('.server-version');
        const iconImg = card.querySelector('.server-icon');

        try {
            const response = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
            const data = await response.json();

            if (data.online) {
                statusBadge.textContent = "Online";
                statusBadge.className = "server-status-badge status-online";
                playerCount.textContent = `Spieler: ${data.players.online}/${data.players.max}`;
                
                if (data.version) {
                    serverVersion.textContent = data.version;
                }
                
                if (data.icon) {
                    iconImg.src = data.icon;
                } else {
                    iconImg.src = "https://via.placeholder.com/48?text=MC";
                }
            } else {
                statusBadge.textContent = "Offline";
                statusBadge.className = "server-status-badge status-offline";
                playerCount.textContent = "Spieler: 0/0";
                iconImg.src = "https://via.placeholder.com/48?text=MC";
            }
        } catch (error) {
            statusBadge.textContent = "Fehler";
            statusBadge.className = "server-status-badge status-offline";
        }
    });
}

fetchServerStatuses();
setInterval(fetchServerStatuses, 60000);