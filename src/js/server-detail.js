function copyIp(button) {
    const ipBox = button.parentElement.querySelector('.ip-text');
    if (!ipBox) return;
    
    const textToCopy = ipBox.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const orig = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check"></i> Kopiert!';
            setTimeout(() => button.innerHTML = orig, 2000);
        });
    }
}

async function initServerDetailPage() {
    const detailCard = document.querySelector('.detail-server-card') || document.querySelector('.server-card');
    if (!detailCard) return;

    const ip = detailCard.getAttribute('data-ip');
    if (!ip) return;

    const statusBadge = detailCard.querySelector('.server-status-badge');
    const playerCount = detailCard.querySelector('.player-count');
    const iconImg = detailCard.querySelector('.server-icon');
    const motdElement = detailCard.querySelector('.server-motd');
    const pingElement = detailCard.querySelector('.server-ping');
    const serverVersion = detailCard.querySelector('.server-version');

    try {
        const startTime = performance.now();
        const response = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
        const endTime = performance.now();
        const measuredPing = Math.round(endTime - startTime);

        const data = await response.json();

        if (data.online) {
            if (statusBadge) {
                statusBadge.textContent = "Online";
                statusBadge.className = "server-status-badge status-online";
            }
            if (playerCount) playerCount.textContent = `Spieler: ${data.players.online}/${data.players.max}`;
            if (pingElement) {
                pingElement.textContent = (data.debug && typeof data.debug.ping === 'number') ? `${data.debug.ping} ms` : `${measuredPing} ms`;
                pingElement.style.display = 'inline-block';
            }
            if (motdElement && data.motd && data.motd.clean) motdElement.textContent = data.motd.clean.join(' ');
            if (serverVersion && data.version) serverVersion.textContent = `Version: ${data.version}`;
            if (iconImg && data.icon) iconImg.src = data.icon;
        } else {
            if (statusBadge) {
                statusBadge.textContent = "Offline";
                statusBadge.className = "server-status-badge status-offline";
            }
            if (playerCount) playerCount.textContent = "Spieler: 0/0";
            if (motdElement) motdElement.textContent = "Can't connect to server";
            if (pingElement) pingElement.style.display = 'none';
        }
    } catch (error) {
        console.error("Fehler beim Server-Fetch:", error);
    }

    // Spieler-JSON laden
    try {
        const response = await fetch(`src/data/players_strudel.json?t=${Date.now()}`);
        if (!response.ok) throw new Error("JSON nicht gefunden");

        const storedPlayers = await response.json();
        renderPlayerHistory(storedPlayers);
    } catch (error) {
        renderPlayerHistory({});
    }
}

function renderPlayerHistory(playersObj) {
    const listContainer = document.getElementById('player-history-list');
    if (!listContainer) return;

    const playerArray = Object.values(playersObj);

    if (playerArray.length === 0) {
        listContainer.innerHTML = '<div class="no-players-text">Noch keine Spieler registriert...</div>';
        return;
    }

    playerArray.sort((a, b) => {
        if (a.isOnline === b.isOnline) return a.name.localeCompare(b.name);
        return a.isOnline ? -1 : 1;
    });

    listContainer.innerHTML = playerArray.map(player => {
        const avatarUrl = player.uuid 
            ? `https://minotar.net/helm/${player.uuid}/24` 
            : `https://minotar.net/helm/${player.name}/24`;

        const statusClass = player.isOnline ? 'status-online' : 'status-offline';
        const statusText = player.isOnline ? 'Online' : 'Offline';

        return `
            <div class="player-history-item ${player.isOnline ? 'is-online' : 'is-offline'}">
                <div class="player-user-info">
                    <img src="${avatarUrl}" alt="${player.name}" onerror="this.src='https://minotar.net/helm/MNS/24'">
                    <span class="player-name">${player.name}</span>
                </div>
                <span class="server-status-badge ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    initServerDetailPage();
    setInterval(initServerDetailPage, 15000);
});